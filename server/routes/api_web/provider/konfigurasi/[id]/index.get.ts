import { qOne } from '../../../../../utils/mysql'
import { toKonfig } from '../../../../../models/konfigurasi'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const row = await qOne('SELECT * FROM konfigurasi WHERE id = ?', [id])
  if (!row) {
    throw createError({ statusCode: 404, data: { error: 'Konfigurasi tidak ditemukan.' } })
  }
  return { data: toKonfig(row) }
})
