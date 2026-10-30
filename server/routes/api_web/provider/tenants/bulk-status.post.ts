import { tx } from '../../../../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : []
  const status = body?.status === 'nonaktif' ? 'nonaktif' : 'aktif'
  if (ids.length === 0) {
    throw createError({ statusCode: 422, data: { errors: { ids: 'Pilih minimal 1 baris.' } } })
  }
  let diubah = 0
  await tx(async (conn) => {
    for (const id of ids) {
      const [res]: any = await conn.query('UPDATE tenants SET status = ? WHERE id = ?', [status, id])
      if (res.affectedRows > 0) diubah++
    }
  })
  return { data: { diubah } }
})
