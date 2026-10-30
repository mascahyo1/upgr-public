import { nowIso, uuidv7 } from '../../../../../utils/db'
import { q, tx } from '../../../../../utils/mysql'
import { validateWebhook } from '../../../../../request/web/tenant/webhooks/impor'
import { requireCred } from '../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const body = await readBody(event)
  const rowsIn = Array.isArray(body?.rows) ? body.rows : []
  const seen = new Set((await q<{ u: string }>('SELECT lower(url) AS u FROM webhooks WHERE credential_id = ?', [id])).map(r => r.u))
  let ditambah = 0
  let dilewati = 0
  await tx(async (conn) => {
    for (const item of rowsIn) {
      const { errs, clean } = validateWebhook(item ?? {})
      if (Object.keys(errs).length > 0) { dilewati++; continue }
      const key = clean.url.toLowerCase()
      if (seen.has(key)) { dilewati++; continue }
      seen.add(key)
      const t = nowIso()
      await conn.query(`INSERT INTO webhooks (id, credential_id, nama, url, prefix, is_active, verify_token, deskripsi, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv7(), id, clean.nama, clean.url, clean.prefix, clean.is_active ? 1 : 0, clean.verify_token, clean.deskripsi, t, t])
      ditambah++
    }
  })
  return { data: { ditambah, dilewati } }
})
