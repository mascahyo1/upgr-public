import { nowIso } from '../../../../../utils/db'
import { q, qOne } from '../../../../../utils/mysql'
import { validateApiKey } from '../../../../../request/web/tenant/api-keys/ubah'
import { toApi } from '../../../../../models/api-key'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const cur = await qOne('SELECT id FROM tenant_api_keys WHERE id = ?', [id])
  if (!cur) {
    throw createError({ statusCode: 404, data: { error: 'API tidak ditemukan.' } })
  }
  const input = await readBody(event)
  const { errs, clean } = validateApiKey(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM tenant_api_keys WHERE `key` = ? AND id <> ?', [clean.key, id])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { key: 'Key ini sudah terdaftar.' } } })
  }
  const t = nowIso()
  await q(`UPDATE tenant_api_keys SET tenant_id = ?, name = ?, status = ?, \`key\` = ?, secret = ?, updated_at = ? WHERE id = ?`,
    [clean.tenant_id, clean.name, clean.status, clean.key, clean.secret, t, id])
  const row = await qOne('SELECT * FROM tenant_api_keys WHERE id = ?', [id])
  return { data: toApi(row) }
})
