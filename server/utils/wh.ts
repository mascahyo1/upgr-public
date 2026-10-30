import { qOne } from './mysql'

export type { WebhookRow } from '../models/webhook'
export { toWh } from '../models/webhook'
export type { LogRow } from '../models/log'
export { toLog } from '../models/log'

export async function requireCred(id: string) {
  const cred = await qOne('SELECT id FROM credentials WHERE id = ?', [id])
  if (!cred) {
    throw createError({ statusCode: 404, data: { error: 'Kredensial tidak ditemukan.' } })
  }
}
