import { nowIso, uuidv7 } from '../../../../utils/db'
import { q, tx } from '../../../../utils/mysql'
import { validateApiKey } from '../../../../request/web/tenant/api-keys/impor'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const rowsIn = Array.isArray(body?.rows) ? body.rows : []
  const seen = new Set((await q<{ key: string }>('SELECT `key` FROM tenant_api_keys')).map(r => r.key))
  let ditambah = 0
  let dilewati = 0
  await tx(async (conn) => {
    for (const item of rowsIn) {
      const { errs, clean } = validateApiKey(item ?? {})
      if (Object.keys(errs).length > 0) { dilewati++; continue }
      if (seen.has(clean.key)) { dilewati++; continue }
      seen.add(clean.key)
      const t = nowIso()
      await conn.query(`INSERT INTO tenant_api_keys (id, tenant_id, name, status, \`key\`, secret, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv7(), clean.tenant_id, clean.name, clean.status, clean.key, clean.secret, t, t])
      ditambah++
    }
  })
  return { data: { ditambah, dilewati } }
})
