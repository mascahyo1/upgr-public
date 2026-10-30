import { nowIso } from '../../../../../utils/db'
import { q, qOne } from '../../../../../utils/mysql'
import { validateKonfigurasi } from '../../../../../request/web/provider/konfigurasi/ubah'
import { toKonfig } from '../../../../../models/konfigurasi'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const cur = await qOne('SELECT id FROM konfigurasi WHERE id = ?', [id])
  if (!cur) {
    throw createError({ statusCode: 404, data: { error: 'Konfigurasi tidak ditemukan.' } })
  }
  const input = await readBody(event)
  const { errs, clean } = validateKonfigurasi(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM konfigurasi WHERE kode = ? AND id <> ?', [clean.kode, id])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { kode: 'Kode ini sudah dipakai.' } } })
  }
  const t = nowIso()
  await q('UPDATE konfigurasi SET kode = ?, nama = ?, type = ?, value = ?, deskripsi = ?, updated_at = ? WHERE id = ?',
    [clean.kode, clean.nama, clean.type, clean.value, clean.deskripsi, t, id])
  const row = await qOne('SELECT * FROM konfigurasi WHERE id = ?', [id])
  return { data: toKonfig(row) }
})
