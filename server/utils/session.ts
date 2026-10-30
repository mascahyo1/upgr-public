import { nowIso, uuidv7 } from './db'
import { q, qOne } from './mysql'

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000
export const SESSION_COOKIE = 'upgr_session'

export async function createSession(area: string, userId: string) {
  const token = uuidv7()
  const now = Date.now()
  await q('INSERT INTO sessions (id, area, user_id, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
    [token, area, userId, nowIso(), now + SESSION_TTL_MS])
  return token
}

export async function getDbSession(token: string) {
  if (!token) return null
  const row = await qOne<{ area: string, user_id: string, expires_at: number }>(
    'SELECT area, user_id, expires_at FROM sessions WHERE id = ?', [token])
  if (!row) return null
  if (Number(row.expires_at) < Date.now()) {
    await q('DELETE FROM sessions WHERE id = ?', [token])
    return null
  }
  return { area: row.area, userId: row.user_id }
}

export async function destroySession(token: string) {
  if (!token) return
  await q('DELETE FROM sessions WHERE id = ?', [token])
}

export function setSessionCookie(event: any, token: string) {
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS / 1000
  })
}

export function clearSessionCookie(event: any) {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function newUserId() {
  return uuidv7()
}
