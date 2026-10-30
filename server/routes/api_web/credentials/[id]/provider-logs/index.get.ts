// Daftar LOG webhook provider per kredensial (notifikasi masuk Midtrans).
// Gaya api-logs/index.get.ts: filter q/hasil/dari/sampai + sort + pagination.
import { q } from '../../../../../utils/mysql'
import { requireCred } from '../../../../../utils/wh'

export interface ProviderLogRow {
  id: string
  credential_id: string
  provider: string
  method: string
  url: string
  http: number | null
  durasi_ms: number | null
  hasil: string
  pesan: string
  request_header: string
  request_body: string
  response_header: string
  response_body: string
  created_at: string
}

export function toProviderLog(r: any): ProviderLogRow {
  return {
    id: r.id,
    credential_id: r.credential_id,
    provider: r.provider ?? '',
    method: r.method ?? 'POST',
    url: r.url ?? '',
    http: r.http ?? null,
    durasi_ms: r.durasi_ms ?? null,
    hasil: r.hasil,
    pesan: r.pesan ?? '',
    request_header: r.request_header ?? '',
    request_body: r.request_body ?? '',
    response_header: r.response_header ?? '',
    response_body: r.response_body ?? '',
    created_at: r.created_at
  }
}

const SORTABLE = new Set(['created_at', 'durasi_ms', 'http'])

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const query = getQuery(event)
  const s = String(query.q ?? '').trim().toLowerCase()
  const hasil = String(query.hasil ?? '').trim()
  const provider = String(query.provider ?? '').trim().toLowerCase()
  const dari = String(query.dari ?? '').trim()
  const sampai = String(query.sampai ?? '').trim()
  const sortRaw = String(query.sort ?? 'created_at')
  const sort = SORTABLE.has(sortRaw) ? sortRaw : 'created_at'
  const dir = String(query.dir ?? query.order ?? '').toLowerCase() === 'asc' ? 'asc' : 'desc'
  const limitRaw = Number(String(query.limit ?? query.per_page ?? 20))
  const limit = Number.isInteger(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20
  const pageRaw = Number(String(query.page ?? 1))
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const cols = ['id', 'credential_id', 'provider', 'method', 'url', 'http', 'durasi_ms', 'hasil', 'pesan', 'request_header', 'request_body', 'response_header', 'response_body', 'created_at']
  const all = await q(`SELECT ${cols.join(', ')} FROM provider_logs WHERE credential_id = ?`, [id]) as any[]
  const rows = all.filter((r) => {
    if (hasil && r.hasil !== hasil) return false
    if (provider && String(r.provider || '').toLowerCase() !== provider) return false
    const day = String(r.created_at || '').slice(0, 10)
    if (dari && day < dari) return false
    if (sampai && day > sampai) return false
    if (s && ((r.provider || '') + ' ' + (r.method || '') + ' ' + (r.url || '') + ' ' + (r.pesan || '')).toLowerCase().indexOf(s) < 0) return false
    return true
  })
  rows.sort((a, b) => {
    let cmp: number
    if (sort === 'durasi_ms' || sort === 'http') cmp = Number(a[sort] ?? 0) - Number(b[sort] ?? 0)
    else cmp = String(a.created_at || '').localeCompare(String(b.created_at || '')) || String(a.id || '').localeCompare(String(b.id || ''))
    return dir === 'asc' ? cmp : -cmp
  })
  const total = rows.length
  const start = (page - 1) * limit
  const items = rows.slice(start, start + limit).map(toProviderLog)
  return { data: items, meta: { total, page, limit } }
})
