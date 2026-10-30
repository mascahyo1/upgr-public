import { nowIso } from '../../../../utils/db'
import { qOne, q } from '../../../../utils/mysql'
import { validateCredential } from '../../../../request/web/tenant/credentials/ubah'
import { toJson } from '../index.get'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const existing = await qOne('SELECT * FROM credentials WHERE id = ?', [id])
  if (!existing) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
  const input = await readBody(event)
  const { errs, clean } = validateCredential(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const t = nowIso()
  await q(`UPDATE credentials SET nama = ?, provider = ?, is_production = ?,
    merchant_id = ?, \`key\` = ?, secret = ?, webhook_verify_token = ?,
    deskripsi = ?, status = ?, updated_at = ? WHERE id = ?`,
    [clean.nama, clean.provider, clean.is_production ? 1 : 0, clean.merchant_id, clean.key, clean.secret, clean.webhook_verify_token, clean.deskripsi, clean.status, t, id])
  const row = await qOne('SELECT * FROM credentials WHERE id = ?', [id])
  return { data: toJson(row) }
})
