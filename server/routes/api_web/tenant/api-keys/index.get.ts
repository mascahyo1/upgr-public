import { q } from '../../../../utils/mysql'
import { toApi } from '../../../../models/api-key'

export default defineEventHandler(async () => {
  const rows = await q('SELECT * FROM tenant_api_keys ORDER BY created_at DESC, id DESC')
  return { data: (rows as any[]).map(toApi) }
})
