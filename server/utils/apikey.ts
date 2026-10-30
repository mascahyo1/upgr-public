import { qOne } from './mysql'
import { toApi, DEFAULT_TENANT_ID } from '../models/api-key'
import type { ApiKeyRow } from '../models/api-key'

export { toApi, DEFAULT_TENANT_ID }
export type { ApiKeyRow }

export async function requireTenantKey(event: any): Promise<ApiKeyRow> {
  const unauthorized = () => createError({ statusCode: 401, data: { error: 'Kredensial API tidak valid atau nonaktif.' } })
  const header = String(getRequestHeader(event, 'authorization') || '')
  const m = header.match(/^Basic\s+(.+)$/i)
  if (!m) throw unauthorized()
  let pair = ''
  try {
    pair = Buffer.from(m[1].trim(), 'base64').toString('utf8')
  } catch { throw unauthorized() }
  const i = pair.indexOf(':')
  if (i < 0) throw unauthorized()
  const row: any = await qOne('SELECT id, tenant_id, name, status FROM tenant_api_keys WHERE `key` = ? AND secret = ?', [pair.slice(0, i), pair.slice(i + 1)])
  if (!row || row.status !== 'aktif') throw unauthorized()
  return toApi(row)
}
