import { q } from '../../../../utils/mysql'
import { toTenant } from '../../../../models/tenant'

export default defineEventHandler(async () => {
  const rows = await q('SELECT * FROM tenants ORDER BY created_at DESC, id DESC')
  return { data: (rows as any[]).map(toTenant) }
})
