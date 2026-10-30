import { nowIso, uuidv7 } from '../../../utils/db'
import { q, tx } from '../../../utils/mysql'
import { validateCredential } from '../../../request/web/tenant/credentials/impor'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const rows = Array.isArray(body?.rows) ? body.rows : []
  const seen = new Set<string>()
  let ditambah = 0
  let dilewati = 0
  const existing = new Set((await q<{ key: string }>('SELECT `key` FROM credentials')).map(r => r.key))
  await tx(async (conn) => {
    for (const item of rows) {
      const { errs, clean } = validateCredential(item ?? {})
      if (Object.keys(errs).length > 0) { dilewati++; continue }
      if (seen.has(clean.key) || existing.has(clean.key)) { dilewati++; continue }
      seen.add(clean.key)
      existing.add(clean.key)
      const t = nowIso()
      const row = { id: uuidv7(), ...clean, created_at: t, updated_at: t }
      await conn.query(`INSERT INTO credentials (id, nama, provider, is_production, merchant_id, \`key\`, secret, webhook_verify_token, deskripsi, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [row.id, row.nama, row.provider, row.is_production ? 1 : 0, row.merchant_id, row.key, row.secret, row.webhook_verify_token, row.deskripsi, row.status, row.created_at, row.updated_at])
      ditambah++
    }
  })
  return { data: { ditambah, dilewati } }
})
