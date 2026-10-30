import { q } from '../../../../../utils/mysql'
import { toWh } from '../../../../../models/webhook'
import { requireCred } from '../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const rows = await q('SELECT * FROM webhooks WHERE credential_id = ? ORDER BY created_at DESC, id DESC', [id])
  return { data: (rows as any[]).map(toWh) }
})
