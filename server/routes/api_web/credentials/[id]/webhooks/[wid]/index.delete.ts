import { q } from '../../../../../../utils/mysql'
import { requireCred } from '../../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const wid = getRouterParam(event, 'wid') as string
  await requireCred(id)
  const res: any = await q('DELETE FROM webhooks WHERE id = ? AND credential_id = ?', [wid, id])
  if (res.affectedRows === 0) {
    throw createError({ statusCode: 404, data: { error: 'Webhook tidak ditemukan.' } })
  }
  return { data: { ok: true } }
})
