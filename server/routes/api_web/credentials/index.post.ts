import { nowIso, uuidv7 } from '../../../utils/db'
import { q } from '../../../utils/mysql'
import { validateCredential } from '../../../request/web/tenant/credentials/tambah'
import { toJson } from './index.get'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const { errs, clean } = validateCredential(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const t = nowIso()
  const row = { id: uuidv7(), ...clean, created_at: t, updated_at: t }
  await q(`INSERT INTO credentials (id, nama, provider, is_production, merchant_id, \`key\`, secret, webhook_verify_token, deskripsi, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.nama, row.provider, row.is_production ? 1 : 0, row.merchant_id, row.key, row.secret, row.webhook_verify_token, row.deskripsi, row.status, row.created_at, row.updated_at])
  setResponseStatus(event, 201)
  return { data: toJson(row) }
})
