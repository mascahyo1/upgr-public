import { q } from '../../../../utils/mysql'
import { toKonfig } from '../../../../models/konfigurasi'

export default defineEventHandler(async () => {
  const rows = await q('SELECT * FROM konfigurasi ORDER BY created_at DESC, id DESC')
  return { data: (rows as any[]).map(toKonfig) }
})
