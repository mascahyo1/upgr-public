import { checkRateLimit } from '../../../utils/ratelimit'
import { verifyTurnstile } from '../../../utils/turnstile'
import { verifyPassword } from '../../../utils/password'
import { qOne } from '../../../utils/mysql'
import { createSession, setSessionCookie } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rl = await checkRateLimit(`login:${ip}`, 10, 60)
  if (!rl.allowed) {
    setResponseStatus(event, 429)
    setHeader(event, 'Retry-After', rl.retryAfter)
    return { data: { error: 'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.', retryAfter: rl.retryAfter } }
  }
  const body = await readBody(event)
  const area = String(body?.area ?? '').trim()
  if (area !== 'tenant' && area !== 'provider') {
    throw createError({ statusCode: 422, data: { errors: { area: 'Area harus tenant atau provider.' } } })
  }
  await verifyTurnstile(String(body?.captcha ?? ''), ip === 'unknown' ? undefined : ip)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  if (!email || !password) {
    throw createError({ statusCode: 422, data: { errors: { email: 'Email dan kata sandi wajib diisi.' } } })
  }
  let userId = ''
  let nama = ''
  if (area === 'tenant') {
    const t = await qOne<{ id: string, password_hash: string, nama: string, status: string }>(
      'SELECT id, password_hash, nama, status FROM tenants WHERE email = ?', [email])
    if (!t || t.status !== 'aktif' || !(await verifyPassword(password, t.password_hash))) {
      throw createError({ statusCode: 401, data: { error: 'Email atau kata sandi salah.' } })
    }
    userId = t.id
    nama = t.nama
  } else {
    const user = await qOne<{ id: string, password_hash: string, nama: string, is_active: number }>(
      'SELECT id, password_hash, nama, is_active FROM users WHERE email = ? AND area = ?', [email, area])
    if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
      throw createError({ statusCode: 401, data: { error: 'Email atau kata sandi salah.' } })
    }
    userId = user.id
    nama = user.nama
  }
  const token = await createSession(area, userId)
  setSessionCookie(event, token)
  return { data: { ok: true, area, nama } }
})
