import { nowIso } from '../../../../../../utils/db'
import { q, qOne } from '../../../../../../utils/mysql'
import { validateWebhook } from '../../../../../../request/web/tenant/webhooks/ubah'
import { toWh } from '../../../../../../models/webhook'
import { requireCred } from '../../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const wid = getRouterParam(event, 'wid') as string
  await requireCred(id)
  const input = await readBody(event)
  const { errs, clean } = validateWebhook(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const cur = await qOne('SELECT id FROM webhooks WHERE id = ? AND credential_id = ?', [wid, id])
  if (!cur) {
    throw createError({ statusCode: 404, data: { error: 'Webhook tidak ditemukan.' } })
  }
  const dup = await qOne('SELECT id FROM webhooks WHERE credential_id = ? AND lower(url) = lower(?) AND id <> ?', [id, clean.url, wid])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { url: 'URL ini sudah terdaftar untuk kredensial ini.' } } })
  }
  const t = nowIso()
  await q(`UPDATE webhooks SET nama = ?, url = ?, prefix = ?, is_active = ?,
    verify_token = ?, deskripsi = ?, updated_at = ? WHERE id = ?`,
    [clean.nama, clean.url, clean.prefix, clean.is_active ? 1 : 0, clean.verify_token, clean.deskripsi, t, wid])
  const row = await qOne('SELECT * FROM webhooks WHERE id = ?', [wid])
  return { data: toWh(row) }
})
