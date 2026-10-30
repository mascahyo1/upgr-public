import { nowIso, uuidv7, safeHeaders } from '../../../../../utils/db'
import { q, tx } from '../../../../../utils/mysql'
import { validateLog } from '../../../../../request/web/tenant/logs/catat'
import { toLog } from '../../../../../models/log'
import { requireCred } from '../../../../../utils/wh'

export const MAX_LOG_PER_CRED = 200

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const input = await readBody(event)
  const { errs, clean } = validateLog(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const t = nowIso()
  const heads = safeHeaders(getRequestHeaders(event) as Record<string, string | string[] | undefined>)
  const row = { id: uuidv7(), credential_id: id, ...clean, created_at: t }
  await tx(async (conn) => {
    await conn.query(`INSERT INTO webhook_logs (id, credential_id, webhook_id, nama, url, event, hasil, http, pesan, ip, user_agent, request_header, request_body, response_header, response_body, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.credential_id, row.webhook_id, row.nama, row.url, row.event, row.hasil, row.http, row.pesan, String(getRequestIP(event, { xForwardedFor: true }) || 'unknown').slice(0, 64), String(heads['user-agent'] || '').slice(0, 500), row.request_header, row.request_body, row.response_header, row.response_body, row.created_at])
    const overRows: any = await conn.query('SELECT COUNT(*) AS n FROM webhook_logs WHERE credential_id = ?', [id])
    const over = (overRows[0][0]?.n ?? 0) - MAX_LOG_PER_CRED
    if (over > 0) {
      const oldRows: any = await conn.query('SELECT id FROM webhook_logs WHERE credential_id = ? ORDER BY created_at ASC, id ASC LIMIT ?', [id, over])
      const ids = (oldRows[0] as any[]).map(r => r.id)
      if (ids.length) await conn.query(`DELETE FROM webhook_logs WHERE id IN (${ids.map(() => '?').join(',')})`, ids as any[])
    }
  })
  setResponseStatus(event, 201)
  return { data: toLog(row) }
})
