// Verifikasi kredensial API tenant (halaman Tenant > API).
// Auth: HTTP Basic, username = key, password = secret.
import { nowIso } from '../../../../utils/db'
import { requireTenantKey } from '../../../../utils/apikey'
import { checkRateLimit } from '../../../../utils/ratelimit'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = await checkRateLimit(`verify:${ip}`, 20, 60)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setHeader(event, 'Retry-After', rl.retryAfter)
    return { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.' } }
  }
  const key = await requireTenantKey(event)
  return { data: { ok: true, tenant_id: key.tenant_id, name: key.name, checked_at: nowIso() } }
})
