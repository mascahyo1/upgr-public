import { tx } from '../../../../../utils/mysql'
import { requireCred } from '../../../../../utils/wh'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  await requireCred(id)
  const body = await readBody(event)
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : []
  if (ids.length === 0) {
    throw createError({ statusCode: 422, data: { errors: { ids: 'Pilih minimal 1 baris.' } } })
  }
  let diproses = 0
  await tx(async (conn) => {
    for (const wid of ids) {
      const [res]: any = await conn.query('DELETE FROM webhooks WHERE id = ? AND credential_id = ?', [wid, id])
      if (res.affectedRows > 0) diproses++
    }
  })
  return { data: { diproses, dilewati: ids.length - diproses } }
})
