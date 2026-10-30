// Penampung simulasi webhook per tenant (catcher gratis milik sendiri).
// POST /api_external/publik/simulator/terima/[tenantId] — PUBLIK, tanpa auth.
// tenantId wajib UUID tenant yang ada (else 404). Mencatat tenant_id + IP +
// header + raw body (dipotong 8000 char). Rate limit 60x/menit per tenant+IP,
// maks 200 baris per tenant, tertua dibuang. Tanpa secret apa pun di sini.
import { nowIso, uuidv7, cut8, bodyJson, safeHeaders } from '../../../../../../utils/db'
import { q, qOne } from '../../../../../../utils/mysql'
import { checkRateLimit } from '../../../../../../utils/ratelimit'

const MAX_SIMULASI = 200

export default defineEventHandler(async (event) => {
  const tenantId = String(getRouterParam(event, 'tenantId') ?? '').trim()
  const tenant = await qOne<{ id: string }>('SELECT id FROM tenants WHERE id = ?', [tenantId])
  if (!tenant) {
    throw createError({ statusCode: 404, data: { error: 'Tenant tidak ditemukan.' } })
  }
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = await checkRateLimit(`simulator:${tenantId}:${ip}`, 60, 60)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setHeader(event, 'Retry-After', rl.retryAfter)
    return { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } }
  }
  const raw = (await readRawBody(event)) ?? ''
  const headers = safeHeaders(getRequestHeaders(event) as Record<string, string | string[] | undefined>)
  const headJson = cut8(JSON.stringify(headers))
  const bodyRaw = cut8(String(raw))
  const reqUrl = getRequestURL(event)
  const fullPath = cut8((reqUrl.pathname + reqUrl.search).slice(0, 500))
  const ua = cut8(String(headers['user-agent'] || '').slice(0, 500))
  const t = nowIso()
  const id = uuidv7()
  const resBody = bodyJson({ data: { ok: true, id, diterima_at: t } })
  await q('INSERT INTO webhook_simulasi (id, tenant_id, ip, user_agent, method, url, request_header, request_body, response_status, response_header, response_body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, tenantId, ip.slice(0, 64), ua, event.method, fullPath, headJson, bodyRaw, 201, cut8(JSON.stringify({ 'content-type': 'application/json' })), resBody, t])
  const overRows: any = await q('SELECT COUNT(*) AS n FROM webhook_simulasi WHERE tenant_id = ?', [tenantId])
  const over = Number(overRows?.[0]?.n ?? 0) - MAX_SIMULASI
  if (over > 0) {
    const oldRows: any = await q('SELECT id FROM webhook_simulasi WHERE tenant_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [tenantId, over])
    const ids = ((oldRows ?? []) as any[]).map((x) => x.id)
    if (ids.length) await q(`DELETE FROM webhook_simulasi WHERE id IN (${ids.map(() => '?').join(',')})`, ids as any[])
  }
  setResponseStatus(event, 201)
  return { data: { ok: true, id, diterima_at: t } }
})
