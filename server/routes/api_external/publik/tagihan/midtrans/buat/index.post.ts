// Buat invoice Midtrans (STATELESS proxy).
// POST /api_external/publik/tagihan/midtrans/buat
// Auth: HTTP Basic (key:secret API key tenant). credential_id di BODY.
// payment_method "gopay_qris_dinamis" -> charge langsung:
//   payment_type "qris" + qris.acquirer "gopay" (QR dinamis per transaksi).
// payment_method "snap" -> halaman bayar Snap (semua channel aktif):
//   respons memuat token + redirect_url untuk dibayar manual.
// items + cust_* nullable: diteruskan ke Midtrans bila diisi (Midtrans
// mencatatnya; respons charge/status TIDAK mengembalikan items/customer).
// Tiap panggilan dicatat ke api_logs TANPA secret.
import { nowIso, uuidv7, cut8, bodyJson } from '../../../../../../utils/db'
import { q, qOne, tx } from '../../../../../../utils/mysql'
import { requireTenantKey } from '../../../../../../utils/apikey'
import { checkRateLimit } from '../../../../../../utils/ratelimit'
import { validateInvoiceBuat } from '../../../../../../request/api/publik/tagihan'

const MAX_API_LOG_PER_CRED = 200

function basic(user: string) {
  return 'Basic ' + Buffer.from(`${user}:`).toString('base64')
}

async function logApi(credId: string, method: string, url: string, http: number | null, started: number, note: string, resBody: string, reqBodyRaw: string) {
  const t = nowIso()
  await tx(async (conn) => {
    await conn.query(`INSERT INTO api_logs (id, credential_id, provider, method, url, http, durasi_ms, hasil, pesan, request_ringkas, response_ringkas, ip, user_agent, request_header, request_body, response_header, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv7(), credId, 'midtrans', method, url.slice(0, 500), http, Date.now() - started, (http !== null && http >= 200 && http < 300) ? 'ok' : 'gagal', note.slice(0, 2000),
        `${method} ${url}`.slice(0, 2000), (http === null ? 'tanpa respons' : `HTTP ${http}`).slice(0, 2000), '', 'UPGR/1.0',
        cut8(JSON.stringify({ authorization: 'Basic ***', 'user-agent': 'UPGR/1.0' })), cut8(reqBodyRaw), cut8(JSON.stringify({ 'content-type': 'application/json' })), resBody, t])
    const overRows: any = await conn.query('SELECT COUNT(*) AS n FROM api_logs WHERE credential_id = ?', [credId])
    const over = (overRows[0][0]?.n ?? 0) - MAX_API_LOG_PER_CRED
    if (over > 0) {
      const oldRows: any = await conn.query('SELECT id FROM api_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [credId, over])
      const ids = (oldRows[0] as any[]).map((r) => r.id)
      if (ids.length) await conn.query(`DELETE FROM api_logs WHERE id IN (${ids.map(() => '?').join(',')})`, ids as any[])
    }
  })
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = await checkRateLimit(`tagihan:${ip}`, 20, 60)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setHeader(event, 'Retry-After', rl.retryAfter)
    return { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } }
  }
  await requireTenantKey(event)
  const input = await readBody(event)
  const { errs, clean } = validateInvoiceBuat(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const cred = await qOne<any>('SELECT * FROM credentials WHERE id = ?', [clean.credential_id])
  if (!cred) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
  if (String(cred.provider || '').trim().toLowerCase() !== 'midtrans') {
    throw createError({ statusCode: 422, data: { errors: { credential_id: 'Kredensial bukan Midtrans.' } } })
  }
  const candidates = [String(cred.secret || ''), String(cred.key || '')]
    .map((s) => s.trim()).filter((s, i, a) => s && a.indexOf(s) === i)
  if (!candidates.length) {
    throw createError({ statusCode: 422, data: { errors: { credential_id: 'Kredensial tidak punya Server Key.' } } })
  }
  const serverKey = candidates[0] as string
  const isProd = !!cred.is_production
  const isSnap = clean.payment_method === 'snap'
  const base = isSnap
    ? (isProd ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com')
    : (isProd ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com')

  const chargeBody: Record<string, any> = isSnap
    ? { transaction_details: { order_id: clean.kode_trx, gross_amount: clean.amount } }
    : {
        payment_type: 'qris',
        qris: { acquirer: 'gopay' },
        transaction_details: { order_id: clean.kode_trx, gross_amount: clean.amount }
      }
  if (clean.items.length > 0) {
    chargeBody.item_details = clean.items.map((it) => ({ id: it.id, price: it.price, quantity: it.quantity, name: it.name }))
  }
  const cust: Record<string, any> = {}
  if (clean.cust_name) cust.first_name = clean.cust_name
  if (clean.cust_email) cust.email = clean.cust_email
  if (clean.cust_phone_number) cust.phone = clean.cust_phone_number
  if (clean.cust_address) {
    cust.billing_address = { address: clean.cust_address }
    if (clean.cust_name) cust.billing_address.first_name = clean.cust_name
    if (clean.cust_phone_number) cust.billing_address.phone = clean.cust_phone_number
  }
  if (Object.keys(cust).length > 0) chargeBody.customer_details = cust
  if (clean.expiry_menit !== null) {
    const wib = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    if (isSnap) {
      chargeBody.expiry = { start_time: `${wib} +0700`, unit: 'minute', duration: clean.expiry_menit }
    } else {
      chargeBody.custom_expiry = { order_time: `${wib} +0700`, expiry_duration: clean.expiry_menit, unit: 'minute' }
    }
  }

  const url = isSnap ? `${base}/snap/v1/transactions` : `${base}/v2/charge`
  const started = Date.now()
  let res: any
  try {
    res = await $fetch.raw(url, {
      method: 'POST',
      headers: { Authorization: basic(serverKey), 'Content-Type': 'application/json', 'User-Agent': 'UPGR/1.0' },
      body: chargeBody,
      timeout: 15000,
      ignoreResponseError: true
    })
  } catch (err: any) {
    throw createError({ statusCode: 502, data: { error: 'Midtrans tidak dapat dihubungi (' + String(err?.message || 'jaringan').slice(0, 120) + ').' } })
  }
  const http = res.status
  const data = (res._data ?? {}) as Record<string, any>
  const resBody = cut8(bodyJson(data))
  await logApi(clean.credential_id, 'POST', url, http, started,
    http >= 200 && http < 300 ? `Invoice dibuat (kode ${clean.kode_trx}).` : `Midtrans menolak (HTTP ${http}).`,
    resBody, bodyJson(chargeBody))
  if (http < 200 || http >= 300) {
    throw createError({ statusCode: http >= 400 && http < 600 ? http : 502, data: { error: `Midtrans menolak (HTTP ${http}).`, provider: data } })
  }
  setResponseStatus(event, 201)
  return {
    data: {
      meta: { payment_gateway_provider: 'midtrans', is_production: isProd, kode_trx: clean.kode_trx },
      payment_gateway_response: data
    }
  }
})
