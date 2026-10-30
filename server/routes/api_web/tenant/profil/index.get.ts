import { qOne } from '../../../../utils/mysql'
import { getDbSession, SESSION_COOKIE } from '../../../../utils/session'

// Profil milik akun tenant yang sedang login (tabel `tenants`).
export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  const sess = await getDbSession(token)
  if (!sess || sess.area !== 'tenant') {
    throw createError({ statusCode: 401, data: { error: 'Sesi berakhir, silakan login kembali.' } })
  }
  const row = await qOne<{ nama: string, email: string, deskripsi: string }>(
    'SELECT nama, email, deskripsi FROM tenants WHERE id = ?', [sess.userId])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Akun tenant tidak ditemukan.' } })
  }
  return { data: { nama: row.nama, email: row.email, deskripsi: row.deskripsi } }
})
