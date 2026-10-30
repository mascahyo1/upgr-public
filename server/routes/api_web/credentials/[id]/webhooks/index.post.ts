import { nowIso, uuidv7 } from '../../../../../utils/db'
import { q, qOne } from '../../../../../utils/mysql'
import { validateWebhook } from '../../../../../request/web/tenant/webhooks/tambah'
import { toWh } from '../../../../../models/webhook'
import { requireCred } from '../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const input = await readBody(event)
  const { errs, clean } = validateWebhook(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM webhooks WHERE credential_id = ? AND lower(url) = lower(?)', [id, clean.url])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { url: 'URL ini sudah terdaftar untuk kredensial ini.' } } })
  }
  const t = nowIso()
  const row = { id: uuidv7(), credential_id: id, ...clean, created_at: t, updated_at: t }
  await q(`INSERT INTO webhooks (id, credential_id, nama, url, prefix, is_active, verify_token, deskripsi, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [row.id, row.credential_id, row.nama, row.url, row.prefix, row.is_active ? 1 : 0, row.verify_token, row.deskripsi, row.created_at, row.updated_at])
  setResponseStatus(event, 201)
  return { data: toWh(row) }
})
