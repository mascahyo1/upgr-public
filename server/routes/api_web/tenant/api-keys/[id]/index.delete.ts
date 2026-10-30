import { q } from '../../../../../utils/mysql'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const res: any = await q('DELETE FROM tenant_api_keys WHERE id = ?', [id])
  if (res.affectedRows === 0) {
    throw createError({ statusCode: 404, data: { error: 'API tidak ditemukan.' } })
  }
  return { data: { ok: true } }
})
