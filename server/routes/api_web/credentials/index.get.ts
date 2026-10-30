import { q } from '../../../utils/mysql'

export default defineEventHandler(async () => {
  const rows = await q('SELECT * FROM credentials ORDER BY created_at DESC, id DESC')
  return { data: rows.map(toJson) }
})

export function toJson(r: any) {
  return {
    id: r.id,
    nama: r.nama,
    provider: r.provider,
    is_production: r.is_production ? true : false,
    merchant_id: r.merchant_id,
    key: r.key,
    secret: r.secret,
    webhook_verify_token: r.webhook_verify_token,
    deskripsi: r.deskripsi,
    status: r.status === 'nonaktif' ? 'nonaktif' : 'aktif',
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}
