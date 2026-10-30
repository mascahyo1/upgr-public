import { nowIso, uuidv7 } from '../../../../utils/db'
import { q, qOne } from '../../../../utils/mysql'
import { validateApiKey } from '../../../../request/web/tenant/api-keys/tambah'
import { toApi } from '../../../../models/api-key'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const { errs, clean } = validateApiKey(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM tenant_api_keys WHERE `key` = ?', [clean.key])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { key: 'Key ini sudah terdaftar.' } } })
  }
  const t = nowIso()
  const row = { id: uuidv7(), ...clean, created_at: t, updated_at: t }
  await q(`INSERT INTO tenant_api_keys (id, tenant_id, name, status, \`key\`, secret, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.tenant_id, row.name, row.status, row.key, row.secret, row.created_at, row.updated_at])
  setResponseStatus(event, 201)
  return { data: toApi(row) }
})
