// URL simulator milik tenant yang sedang login (untuk tombol Salin).
import { getDbSession, SESSION_COOKIE } from '../../../../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  const sess = await getDbSession(token)
  if (!sess || sess.area !== 'tenant') {
    throw createError({ statusCode: 401, data: { error: 'Sesi berakhir, silakan login kembali.' } })
  }
  return { data: { tenant_id: sess.userId } }
})
