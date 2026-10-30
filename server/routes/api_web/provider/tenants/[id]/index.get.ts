import { qOne } from '../../../../../utils/mysql'
import { toTenant } from '../../../../../models/tenant'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const row = await qOne('SELECT * FROM tenants WHERE id = ?', [id])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Tenant tidak ditemukan.' } })
  }
  return { data: toTenant(row) }
})
