// Uji kredensial payment gateway ke API provider LANGSUNG (tanpa buat transaksi,
// tanpa gerakkan uang). Dispatch mengikuti nilai `provider` milik kredensial.
// - midtrans: GET /v2/{order_id}/status order fiktif. Sumber:
//   https://docs.midtrans.com/reference/get-transaction-status (endpoint + Basic Auth
//   server key). Kunci diterima = order fiktif tidak ada (HTTP 404, atau HTTP 200
//   dengan body status_code 404 — perilaku aktual API Midtrans); kunci ditolak = 401.
// - xendit: GET /balance. Sumber: https://docs.xendit.co/get-balance (Basic Auth
//   API key sebagai username). 200 = kunci valid; 401 = kunci ditolak.
// - provider lain: 422 belum didukung (butuh parameter khusus merchant).
// Setiap probe midtrans/xendit dicatat ke tabel api_logs TANPA secret: ringkasan
// aman (metode + URL + status HTTP + durasi + note) + 4 kolom detail header/body
// yang sudah disensor (Authorization asli TIDAK PERNAH disimpan di kolom mana pun
// — diganti 'Basic ***'; GET tanpa body) dan tiap nilainya dipotong 8000 char.
import { nowIso, uuidv7, cut8, headersJson, bodyJson } from '../../../../utils/db'
import { qOne, tx } from '../../../../utils/mysql'
import { requireCred } from '../../../../utils/wh'
import { checkRateLimit } from '../../../../utils/ratelimit'

function basic(user: string, pass = '') {
  return 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')
}

interface Probe {
  ok: boolean
  http: number | null
  note: string
  url: string
  resHead: string
  resBody: string
}

// Batas + probe: uuidv7/cut8/headersJson/bodyJson dari server/utils/db
// (satu-satunya salinan helper sensor).
const MAX_API_LOG_PER_CRED = 200

async function probeMidtrans(secret: string, key: string, isProd: boolean): Promise<Probe> {
  const base = isProd ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
  const orderId = `UPGR-CRED-CHECK-${Date.now()}`
  const url = `${base}/v2/${orderId}/status`
  const candidates = [secret, key].map((s) => (s || '').trim()).filter((s, i, a) => s && a.indexOf(s) === i)
  if (!candidates.length) return { ok: false, http: null, note: 'Kunci kredensial kosong.', url, resHead: '', resBody: '' }
  let last401 = false
  let lastHead = ''
  let lastBody = ''
  for (const cand of candidates) {
    try {
      const res = await $fetch.raw(url, {
        method: 'GET',
        headers: { Authorization: basic(cand), 'User-Agent': 'UPGR/1.0' },
        timeout: 10000,
        ignoreResponseError: true
      })
      const rh = cut8(headersJson((res as any).headers))
      const rb = cut8(bodyJson((res as any)._data))
      const bodyCode = String((res._data as any)?.status_code ?? '')
      if (res.status === 404 || bodyCode === '404') return { ok: true, http: res.status, note: 'Kunci diterima Midtrans (order contoh memang tidak ada).', url, resHead: rh, resBody: rb }
      if (res.status === 401 || bodyCode === '401') { last401 = true; lastHead = rh; lastBody = rb; continue }
      return { ok: false, http: res.status, note: `Respons tak terduga dari Midtrans (HTTP ${res.status}).`, url, resHead: rh, resBody: rb }
    } catch (err: any) {
      return { ok: false, http: null, note: 'Midtrans tidak dapat dihubungi (' + String(err?.message || 'jaringan').slice(0, 120) + ').', url, resHead: '', resBody: '' }
    }
  }
  if (last401) return { ok: false, http: 401, note: 'Kunci ditolak Midtrans (HTTP 401). Periksa Server Key.', url, resHead: lastHead, resBody: lastBody }
  return { ok: false, http: null, note: 'Kunci kredensial kosong.', url, resHead: '', resBody: '' }
}

async function probeXendit(secret: string): Promise<Probe> {
  const url = 'https://api.xendit.co/balance'
  if (!secret.trim()) return { ok: false, http: null, note: 'Kunci kredensial kosong.', url, resHead: '', resBody: '' }
  try {
    const res = await $fetch.raw(url, {
      method: 'GET',
      headers: { Authorization: basic(secret.trim()), 'User-Agent': 'UPGR/1.0' },
      timeout: 10000,
      ignoreResponseError: true
    })
    const rh = cut8(headersJson((res as any).headers))
    const rb = cut8(bodyJson((res as any)._data))
    if (res.status === 200) {
      const bal = (res._data as any)?.balance
      return { ok: true, http: 200, note: 'Kunci valid' + (bal !== undefined ? ` (saldo tercatat ${bal}).` : '.'), url, resHead: rh, resBody: rb }
    }
    if (res.status === 401) return { ok: false, http: 401, note: 'Kunci ditolak Xendit (HTTP 401). Periksa secret API key.', url, resHead: rh, resBody: rb }
    return { ok: false, http: res.status, note: `Respons tak terduga dari Xendit (HTTP ${res.status}).`, url, resHead: rh, resBody: rb }
  } catch (err: any) {
    return { ok: false, http: null, note: 'Xendit tidak dapat dihubungi (' + String(err?.message || 'jaringan').slice(0, 120) + ').', url, resHead: '', resBody: '' }
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = await checkRateLimit(`credtest:${ip}`, 10, 60)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setHeader(event, 'Retry-After', rl.retryAfter)
    return { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } }
  }
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const cred = await qOne<any>('SELECT * FROM credentials WHERE id = ?', [id])
  if (!cred) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
  const provider = String(cred.provider || '').trim().toLowerCase()
  const mode = cred.is_production ? 'Production' : 'Sandbox'
  const t = nowIso()
  const started = Date.now()
  let probe: Probe
  if (provider === 'midtrans') {
    probe = await probeMidtrans(String(cred.secret || ''), String(cred.key || ''), !!cred.is_production)
  } else if (provider === 'xendit') {
    probe = await probeXendit(String(cred.secret || cred.key || ''))
  } else {
    throw createError({ statusCode: 422, data: { errors: { provider: `Uji otomatis untuk provider "${provider || '-'}" belum didukung.` } } })
  }
  const apiRow = {
    id: uuidv7(),
    credential_id: id,
    provider,
    method: 'GET',
    url: probe.url.slice(0, 500),
    http: probe.http,
    durasi_ms: Date.now() - started,
    hasil: probe.ok ? 'ok' : 'gagal',
    pesan: probe.note.slice(0, 2000),
    request_ringkas: `GET ${probe.url}`.slice(0, 2000),
    response_ringkas: (probe.http === null ? 'tanpa respons' : `HTTP ${probe.http}`).slice(0, 2000),
    request_header: cut8(JSON.stringify({ authorization: 'Basic ***', 'user-agent': 'UPGR/1.0' })),
    request_body: '',
    response_header: probe.resHead,
    response_body: probe.resBody,
    created_at: t
  }
  await tx(async (conn) => {
    await conn.query(`INSERT INTO api_logs (id, credential_id, provider, method, url, http, durasi_ms, hasil, pesan, request_ringkas, response_ringkas, ip, user_agent, request_header, request_body, response_header, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [apiRow.id, apiRow.credential_id, apiRow.provider, apiRow.method, apiRow.url, apiRow.http, apiRow.durasi_ms, apiRow.hasil, apiRow.pesan, apiRow.request_ringkas, apiRow.response_ringkas, '', 'UPGR/1.0', apiRow.request_header, apiRow.request_body, apiRow.response_header, apiRow.response_body, apiRow.created_at])
    const overRows: any = await conn.query('SELECT COUNT(*) AS n FROM api_logs WHERE credential_id = ?', [id])
    const over = (overRows[0][0]?.n ?? 0) - MAX_API_LOG_PER_CRED
    if (over > 0) {
      const oldRows: any = await conn.query('SELECT id FROM api_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [id, over])
      const ids = (oldRows[0] as any[]).map(r => r.id)
      if (ids.length) await conn.query(`DELETE FROM api_logs WHERE id IN (${ids.map(() => '?').join(',')})`, ids as any[])
    }
  })
  return { data: { ok: probe.ok, provider, mode, http: probe.http, pesan: probe.note, checked_at: t } }
})
