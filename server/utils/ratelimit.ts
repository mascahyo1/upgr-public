import { q } from './mysql'

export async function checkRateLimit(key: string, limit: number, windowSec: number) {
  const now = Date.now()
  const since = now - windowSec * 1000
  await q('DELETE FROM auth_attempts WHERE ts < ?', [since])
  const rows = await q<{ n: number }>('SELECT COUNT(*) AS n FROM auth_attempts WHERE `key` = ?', [key])
  const used = rows[0]?.n ?? 0
  if (used >= limit) {
    const oldest = await q<{ ts: number }>('SELECT ts FROM auth_attempts WHERE `key` = ? ORDER BY ts ASC LIMIT 1', [key])
    const oldestTs = oldest[0]?.ts ?? 0
    const retryAfter = oldest.length ? Math.max(1, Math.ceil((oldestTs + windowSec * 1000 - now) / 1000)) : windowSec
    return { allowed: false as const, retryAfter }
  }
  await q('INSERT INTO auth_attempts (`key`, ts) VALUES (?, ?)', [key, now])
  return { allowed: true as const, retryAfter: 0 }
}
