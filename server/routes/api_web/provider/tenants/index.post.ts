import { nowIso, uuidv7 } from '../../../../utils/db'
import { q, qOne } from '../../../../utils/mysql'
import { validateTenant } from '../../../../request/web/provider/tenants/tambah'
import { hashPassword } from '../../../../utils/password'
import { toTenant } from '../../../../models/tenant'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const { errs, clean } = validateTenant({ ...(input ?? {}), isEdit: false })
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM tenants WHERE email = ?', [clean.email])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { email: 'Email ini sudah terdaftar.' } } })
  }
  const t = nowIso()
  const id = uuidv7()
  await q(`INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'provider', ?, ?)`,
    [id, clean.nama, clean.email, await hashPassword(clean.password), clean.deskripsi, clean.status, t, t])
  const row = await qOne('SELECT * FROM tenants WHERE id = ?', [id])
  setResponseStatus(event, 201)
  return { data: toTenant(row) }
})
