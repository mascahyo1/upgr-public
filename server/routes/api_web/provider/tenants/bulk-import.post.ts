import { nowIso, uuidv7 } from '../../../../utils/db'
import { q, tx } from '../../../../utils/mysql'
import { validateTenant } from '../../../../request/web/provider/tenants/impor'
import { hashPassword } from '../../../../utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const rowsIn = Array.isArray(body?.rows) ? body.rows : []
  const seen = new Set((await q<{ email: string }>('SELECT email FROM tenants')).map(r => r.email.toLowerCase()))
  let ditambah = 0
  let dilewati = 0
  await tx(async (conn) => {
    for (const item of rowsIn) {
      const { errs, clean } = validateTenant({ ...(item ?? {}), isEdit: false })
      if (Object.keys(errs).length > 0) { dilewati++; continue }
      if (seen.has(clean.email.toLowerCase())) { dilewati++; continue }
      seen.add(clean.email.toLowerCase())
      const t = nowIso()
      await conn.query(`INSERT INTO tenants (id, nama, email, password_hash, deskripsi, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'provider', ?, ?)`,
        [uuidv7(), clean.nama, clean.email, await hashPassword(clean.password), clean.deskripsi, clean.status, t, t])
      ditambah++
    }
  })
  return { data: { ditambah, dilewati } }
})
