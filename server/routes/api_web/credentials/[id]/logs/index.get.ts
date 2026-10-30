import { q } from '../../../../../utils/mysql'
import { toLog } from '../../../../../models/log'
import { requireCred } from '../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const query = getQuery(event)
  const s = String(query.q ?? '').trim().toLowerCase()
  const hasil = String(query.hasil ?? '').trim()
  const dari = String(query.dari ?? '').trim()
  const sampai = String(query.sampai ?? '').trim()
  const all = await q('SELECT * FROM webhook_logs WHERE credential_id = ? ORDER BY created_at DESC, id DESC', [id]) as any[]
  const rows = all.filter((r) => {
    if (hasil && r.hasil !== hasil) return false
    const day = String(r.created_at || '').slice(0, 10)
    if (dari && day < dari) return false
    if (sampai && day > sampai) return false
    if (s && ((r.nama || '') + ' ' + (r.url || '') + ' ' + (r.pesan || '')).toLowerCase().indexOf(s) < 0) return false
    return true
  })
  return {
    data: rows.map((r) => ({
      ...toLog(r),
      request_header: r.request_header ?? '',
      request_body: r.request_body ?? '',
      response_header: r.response_header ?? '',
      response_body: r.response_body ?? ''
    }))
  }
})
