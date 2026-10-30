import { qOne } from '../../../utils/mysql'
import { getDbSession, SESSION_COOKIE } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  const sess = await getDbSession(token)
  if (!sess) {
    throw createError({ statusCode: 401, data: { error: 'Belum login.' } })
  }
  if (sess.area === 'tenant') {
    const t = await qOne<{ nama: string, email: string }>('SELECT nama, email FROM tenants WHERE id = ?', [sess.userId])
    if (!t) {
      throw createError({ statusCode: 401, data: { error: 'Belum login.' } })
    }
    return { data: { area: sess.area, nama: t.nama, email: t.email } }
  }
  const user = await qOne<{ nama: string, email: string }>('SELECT nama, email FROM users WHERE id = ?', [sess.userId])
  if (!user) {
    throw createError({ statusCode: 401, data: { error: 'Belum login.' } })
  }
  return { data: { area: sess.area, nama: user.nama, email: user.email } }
})
