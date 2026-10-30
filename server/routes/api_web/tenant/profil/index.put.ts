import { nowIso } from '../../../../utils/db'
import { q, qOne } from '../../../../utils/mysql'
import { getDbSession, SESSION_COOKIE } from '../../../../utils/session'
import { validateProfil } from '../../../../request/web/tenant/profil/ubah'

// Ubah identitas milik akun tenant yang sedang login (tabel `tenants`).
export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  const sess = await getDbSession(token)
  if (!sess || sess.area !== 'tenant') {
    throw createError({ statusCode: 401, data: { error: 'Sesi berakhir, silakan login kembali.' } })
  }
  const input = await readBody(event)
  const { errs, clean } = validateProfil(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dupe = await qOne<{ id: string }>(
    'SELECT id FROM tenants WHERE email = ? AND id <> ?', [clean.email, sess.userId])
  if (dupe) {
    throw createError({ statusCode: 422, data: { errors: { email: 'Email sudah dipakai tenant lain.' } } })
  }
  await q('UPDATE tenants SET nama = ?, email = ?, deskripsi = ?, updated_at = ? WHERE id = ?',
    [clean.nama, clean.email, clean.deskripsi, nowIso(), sess.userId])
  return { data: { ...clean } }
})
