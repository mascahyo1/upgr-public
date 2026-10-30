// Satu entri LOG webhook router (UPGR -> app) milik kredensial.
// 404 bila ID tak valid atau baris bukan milik kredensial ini.
import { qOne } from '../../../../../../utils/mysql'
import { requireCred } from '../../../../../../utils/wh'

const UUIDV7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const logId = getRouterParam(event, 'logId') as string
  await requireCred(id)
  if (!UUIDV7.test(logId || '')) {
    throw createError({ statusCode: 404, data: { error: 'Log router tidak ditemukan.' } })
  }
  const cols = ['id', 'credential_id', 'webhook_id', 'nama', 'url', 'event', 'hasil', 'http', 'pesan', 'ip', 'user_agent', 'request_header', 'request_body', 'response_header', 'response_body', 'created_at']
  const row = await qOne(`SELECT ${cols.join(', ')} FROM webhook_logs WHERE id = ? AND credential_id = ?`, [logId, id])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Log router tidak ditemukan.' } })
  }
  const r: any = row
  return {
    data: {
      id: r.id,
      credential_id: r.credential_id,
      webhook_id: r.webhook_id ?? '',
      nama: r.nama ?? '',
      url: r.url ?? '',
      event: r.event ?? 'Uji kirim',
      hasil: r.hasil,
      http: r.http ?? null,
      pesan: r.pesan ?? '',
      ip: r.ip ?? '',
      user_agent: r.user_agent ?? '',
      request_header: r.request_header ?? '',
      request_body: r.request_body ?? '',
      response_header: r.response_header ?? '',
      response_body: r.response_body ?? '',
      created_at: r.created_at
    }
  }
})
