import { nowIso, uuidv7 } from '../../../../utils/db'
import { q, qOne } from '../../../../utils/mysql'
import { validateKonfigurasi } from '../../../../request/web/provider/konfigurasi/tambah'
import { toKonfig } from '../../../../models/konfigurasi'

export default defineEventHandler(async (event) => {
  const input = await readBody(event)
  const { errs, clean } = validateKonfigurasi(input ?? {})
  if (Object.keys(errs).length > 0) {
    throw createError({ statusCode: 422, data: { errors: errs } })
  }
  const dup = await qOne('SELECT id FROM konfigurasi WHERE kode = ?', [clean.kode])
  if (dup) {
    throw createError({ statusCode: 409, data: { errors: { kode: 'Kode ini sudah dipakai.' } } })
  }
  const t = nowIso()
  const id = uuidv7()
  await q('INSERT INTO konfigurasi (id, kode, nama, type, value, deskripsi, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, clean.kode, clean.nama, clean.type, clean.value, clean.deskripsi, t, t])
  const row = await qOne('SELECT * FROM konfigurasi WHERE id = ?', [id])
  setResponseStatus(event, 201)
  return { data: toKonfig(row) }
})
