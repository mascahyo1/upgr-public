import { nowIso, uuidv7 } from '../../../utils/db'
import { q } from '../../../utils/mysql'
import { hashPassword } from '../../../utils/password'

export default defineEventHandler(async (event) => {
  if (process.env.ALLOW_TEST_API !== '1') {
    throw createError({ statusCode: 403, data: { error: 'Endpoint uji hanya tersedia di development.' } })
  }
  const t = nowIso()
  const hash = await hashPassword('sandi-uji-123')
  await q('DELETE FROM tenants WHERE email = ?', ['uji@example.com'])
  await q(`INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at)
    VALUES (?, 'Pengguna Uji', 'uji@example.com', ?, 'Akun uji E2E', 'aktif', 'seed', ?, ?)`,
    [uuidv7(), hash, t, t])
  return { data: { ok: true, email: 'uji@example.com' } }
})
