import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return new Promise<string>((resolve, reject) => {
    scrypt(password, salt, 64, (err, buf) => {
      if (err) reject(err)
      else resolve(`scrypt$${salt}$${(buf as Buffer).toString('hex')}`)
    })
  })
}

export function verifyPassword(password: string, stored: string) {
  const parts = String(stored || '').split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return Promise.resolve(false)
  const [, salt, hex] = parts
  return new Promise<boolean>((resolve) => {
    scrypt(password, salt ?? '', 64, (err, buf) => {
      if (err) return resolve(false)
      try {
        const a = Buffer.from((buf as Buffer).toString('hex'))
        const b = Buffer.from(hex ?? '')
        resolve(a.length === b.length && timingSafeEqual(a, b))
      } catch {
        resolve(false)
      }
    })
  })
}
