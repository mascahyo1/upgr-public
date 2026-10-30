import { destroySession, clearSessionCookie, SESSION_COOKIE } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE) || ''
  await destroySession(token)
  clearSessionCookie(event)
  return { data: { ok: true } }
})
