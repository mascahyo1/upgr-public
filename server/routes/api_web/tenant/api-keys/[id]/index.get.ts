import { qOne } from '../../../../../utils/mysql'
import { toApi } from '../../../../../models/api-key'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const row = await qOne('SELECT * FROM tenant_api_keys WHERE id = ?', [id])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'API tidak ditemukan.' } })
  }
  return { data: toApi(row) }
})
