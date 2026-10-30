import { hashPassword, verifyPassword } from '../../../utils/password'
import { q, qOne } from '../../../utils/mysql'
import { getDbSession, SESSION_COOKIE } from '../../../utils/session'

// Ganti kata sandi akun tenant yang sedang login.
export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  const sess = await getDbSession(token)
  if (!sess || sess.area !== 'tenant') {
    throw createError({ statusCode: 401, data: { error: 'Sesi berakhir, silakan login kembali.' } })
  }
  const input = await readBody(event)
  const lama = String(input?.password_lama ?? '')
  const baru = String(input?.password_baru ?? '')
  const konfirmasi = String(input?.konfirmasi ?? '')
  const errs: Record<string, string> = {}
  if (!lama) errs.password_lama = 'Kata sandi lama wajib diisi.'
  if (baru.length < 8) errs.password_baru = 'Kata sandi baru minimal 8 karakter.'
  else if (baru.length > 100) errs.password_baru = 'Kata sandi baru maksimal 100 karakter.'
  if (konfirmasi !== baru) errs.konfirmasi = 'Konfirmasi tidak sama dengan kata sandi baru.'
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const row = await qOne<{ password_hash: string }>('SELECT password_hash FROM tenants WHERE id = ?', [sess.userId])
  if (!row || !(await verifyPassword(lama, row.password_hash))) {
    throw createError({ statusCode: 422, data: { errors: { password_lama: 'Kata sandi lama salah.' } } })
  }
  await q('UPDATE tenants SET password_hash = ? WHERE id = ?', [await hashPassword(baru), sess.userId])
  return { data: { ok: true } }
})
