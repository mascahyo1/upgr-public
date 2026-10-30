import { q } from '../../../../utils/mysql'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const res: any = await q('DELETE FROM credentials WHERE id = ?', [id])
  if (res.affectedRows === 0) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
  return { data: { ok: true } }
})
