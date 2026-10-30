import { nowIso, uuidv7 } from '../../../../utils/db'
import { q, tx } from '../../../../utils/mysql'
import { validateKonfigurasi } from '../../../../request/web/provider/konfigurasi/impor'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const rowsIn = Array.isArray(body?.rows) ? body.rows : []
  const seen = new Set((await q<{ kode: string }>('SELECT kode FROM konfigurasi')).map(r => r.kode.toLowerCase()))
  let ditambah = 0
  let dilewati = 0
  await tx(async (conn) => {
    for (const item of rowsIn) {
      const { errs, clean } = validateKonfigurasi(item ?? {})
      if (Object.keys(errs).length > 0) { dilewati++; continue }
      if (seen.has(clean.kode.toLowerCase())) { dilewati++; continue }
      seen.add(clean.kode.toLowerCase())
      const t = nowIso()
      await conn.query('INSERT INTO konfigurasi (id, kode, nama, type, value, deskripsi, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv7(), clean.kode, clean.nama, clean.type, clean.value, clean.deskripsi, t, t])
      ditambah++
    }
  })
  return { data: { ditambah, dilewati } }
})
