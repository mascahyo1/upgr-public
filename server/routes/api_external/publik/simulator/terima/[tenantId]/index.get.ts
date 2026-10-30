// Lihat tangkapan simulasi milik sendiri. tenantId path wajib = sesi tenant.
import { q } from '../../../../../../utils/mysql'
import { getDbSession, SESSION_COOKIE } from '../../../../../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  const sess = await getDbSession(token)
  if (!sess || sess.area !== 'tenant') {
    throw createError({ statusCode: 401, data: { error: 'Sesi berakhir, silakan login kembali.' } })
  }
  const tenantId = String(getRouterParam(event, 'tenantId') ?? '').trim()
  if (tenantId !== sess.userId) {
    throw createError({ statusCode: 403, data: { error: 'Akses ditolak.' } })
  }
  const rows = await q<any>('SELECT * FROM webhook_simulasi WHERE tenant_id = ? ORDER BY created_at DESC, id DESC LIMIT 200', [tenantId])
  return { data: rows }
})
