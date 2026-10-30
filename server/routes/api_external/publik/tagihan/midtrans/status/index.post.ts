// Cek status invoice Midtrans GoPay QRIS dinamis (STATELESS proxy).
// POST /api_external/publik/tagihan/midtrans/status
// Auth: HTTP Basic (key:secret API key tenant). Body: credential_id + kode_trx.
// Proxy ke Midtrans GET /v2/{kode_trx}/status. Kode tak ada -> 404.
// payment_gateway_response = JSON Midtrans apa adanya (tidak memuat
// items/customer; itu hanya tercatat di sisi Midtrans/dashboard + api_logs UPGR).
import { nowIso, uuidv7, cut8, bodyJson } from '../../../../../../utils/db'
import { q, qOne, tx } from '../../../../../../utils/mysql'
import { requireTenantKey } from '../../../../../../utils/apikey'
import { checkRateLimit } from '../../../../../../utils/ratelimit'
import { validateInvoiceStatus } from '../../../../../../request/api/publik/tagihan'

const MAX_API_LOG_PER_CRED = 200

function basic(user: string) {
  return 'Basic ' + Buffer.from(`${user}:`).toString('base64')
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = await checkRateLimit(`tagihan-status:${ip}`, 20, 60)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setHeader(event, 'Retry-After', rl.retryAfter)
    return { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } }
  }
  await requireTenantKey(event)
  const input = await readBody(event)
  const { errs, clean } = validateInvoiceStatus(input ?? {})
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
  const base = isProd ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
  const url = `${base}/v2/${encodeURIComponent(clean.kode_trx)}/status`
  const started = Date.now()
  let res: any
  try {
    res = await $fetch.raw(url, {
      method: 'GET',
      headers: { Authorization: basic(serverKey) },
      timeout: 15000,
      ignoreResponseError: true
    })
  } catch (err: any) {
    throw createError({ statusCode: 502, data: { error: 'Midtrans tidak dapat dihubungi (' + String(err?.message || 'jaringan').slice(0, 120) + ').' } })
  }
  const http = res.status
  const data = (res._data ?? {}) as Record<string, any>
  const resBody = cut8(bodyJson(data))
  const ok = http >= 200 && http < 300
  const note = ok
    ? `Status ${data.transaction_status ?? '?'} (kode ${clean.kode_trx}).`
    : (http === 404 ? `Tagihan tidak ada di Midtrans (kode ${clean.kode_trx}).` : `Midtrans menolak (HTTP ${http}).`)
  const t = nowIso()
  await tx(async (conn) => {
    await conn.query(`INSERT INTO api_logs (id, credential_id, provider, method, url, http, durasi_ms, hasil, pesan, request_ringkas, response_ringkas, ip, user_agent, request_header, request_body, response_header, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv7(), clean.credential_id, 'midtrans', 'GET', url.slice(0, 500), http, Date.now() - started, ok ? 'ok' : 'gagal', note.slice(0, 2000),
        `GET ${url}`.slice(0, 2000), (http === null ? 'tanpa respons' : `HTTP ${http}`).slice(0, 2000), '', 'UPGR/1.0',
        cut8(JSON.stringify({ authorization: 'Basic ***', 'user-agent': 'UPGR/1.0' })), '', cut8(JSON.stringify({ 'content-type': 'application/json' })), resBody, t])
    const overRows: any = await conn.query('SELECT COUNT(*) AS n FROM api_logs WHERE credential_id = ?', [clean.credential_id])
    const over = (overRows[0][0]?.n ?? 0) - MAX_API_LOG_PER_CRED
    if (over > 0) {
      const oldRows: any = await conn.query('SELECT id FROM api_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [clean.credential_id, over])
      const ids = (oldRows[0] as any[]).map((r) => r.id)
      if (ids.length) await conn.query(`DELETE FROM api_logs WHERE id IN (${ids.map(() => '?').join(',')})`, ids as any[])
    }
  })
  if (!ok) {
    if (http === 404) {
      throw createError({ statusCode: 404, data: { error: `Tagihan tidak ada di Midtrans (kode ${clean.kode_trx}).`, provider: data } })
    }
    throw createError({ statusCode: http >= 400 && http < 600 ? http : 502, data: { error: `Midtrans menolak (HTTP ${http}).`, provider: data } })
  }
  return {
    data: {
      meta: { payment_gateway_provider: 'midtrans', is_production: isProd, kode_trx: clean.kode_trx },
      payment_gateway_response: data
    }
  }
})
