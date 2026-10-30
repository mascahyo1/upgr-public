// Detail satu tangkapan milik sendiri (header/body request + response).
import { qOne } from '../../../../../../../utils/mysql'
import { getDbSession, SESSION_COOKIE } from '../../../../../../../utils/session'

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
  const simId = String(getRouterParam(event, 'simId') ?? '').trim()
  const row = await qOne<any>('SELECT * FROM webhook_simulasi WHERE id = ? AND tenant_id = ?', [simId, tenantId])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Tangkapan tidak ditemukan.' } })
  }
  return { data: row }
})
