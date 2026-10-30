import { qOne } from '../../../../utils/mysql'
import { toJson } from '../index.get'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const row = await qOne('SELECT * FROM credentials WHERE id = ?', [id])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
  return { data: toJson(row) }
})
