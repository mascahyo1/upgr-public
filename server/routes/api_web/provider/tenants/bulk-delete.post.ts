import { tx } from '../../../../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : []
  if (ids.length === 0) {
    throw createError({ statusCode: 422, data: { errors: { ids: 'Pilih minimal 1 baris.' } } })
  }
  let diproses = 0
  await tx(async (conn) => {
    for (const id of ids) {
      const [res]: any = await conn.query('DELETE FROM tenants WHERE id = ?', [id])
      if (res.affectedRows > 0) diproses++
    }
  })
  return { data: { diproses, dilewati: ids.length - diproses } }
})
