import { nowIso } from '../../../../../utils/db'
import { q, qOne } from '../../../../../utils/mysql'
import { validateTenant } from '../../../../../request/web/provider/tenants/ubah'
import { hashPassword } from '../../../../../utils/password'
import { toTenant } from '../../../../../models/tenant'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const cur = await qOne('SELECT id FROM tenants WHERE id = ?', [id])
  if (!cur) {
    throw createError({ statusCode: 404, data: { error: 'Tenant tidak ditemukan.' } })
  }
  const input = await readBody(event)
  const { errs, clean } = validateTenant({ ...(input ?? {}), isEdit: true })
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM tenants WHERE email = ? AND id <> ?', [clean.email, id])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { email: 'Email ini sudah terdaftar.' } } })
  }
  const t = nowIso()
  if (clean.password) {
    await q('UPDATE tenants SET nama = ?, email = ?, password_hash = ?, deskripsi = ?, status = ?, updated_at = ? WHERE id = ?',
      [clean.nama, clean.email, await hashPassword(clean.password), clean.deskripsi, clean.status, t, id])
  } else {
    await q('UPDATE tenants SET nama = ?, email = ?, deskripsi = ?, status = ?, updated_at = ? WHERE id = ?',
      [clean.nama, clean.email, clean.deskripsi, clean.status, t, id])
  }
  const row = await qOne('SELECT * FROM tenants WHERE id = ?', [id])
  return { data: toTenant(row) }
})
