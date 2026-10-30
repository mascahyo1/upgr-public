import { qOne } from '../../../../../../utils/mysql'
import { toWh } from '../../../../../../models/webhook'
import { requireCred } from '../../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const wid = getRouterParam(event, 'wid') as string
  await requireCred(id)
  const row = await qOne('SELECT * FROM webhooks WHERE id = ? AND credential_id = ?', [wid, id])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Webhook tidak ditemukan.' } })
  }
  return { data: toWh(row) }
})
