export async function verifyTurnstile(token: string, ip?: string) {
  if (process.env.TURNSTILE_DUMMY === '1') return
  const secret = process.env.TURNSTILE_SECRET_KEY || ''
  if (!secret) {
    throw createError({ statusCode: 500, data: { error: 'Turnstile belum dikonfigurasi di server.' } })
  }
  if (!token) {
    throw createError({ statusCode: 422, data: { errors: { captcha: 'Verifikasi captcha wajib diisi.' } } })
  }
  let res: any
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    res = await $fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      timeout: 10000
    })
  } catch {
    throw createError({ statusCode: 503, data: { error: 'Layanan verifikasi captcha tidak dapat dihubungi.' } })
  }
  if (!res?.success) {
    throw createError({ statusCode: 422, data: { errors: { captcha: 'Verifikasi captcha gagal.' } } })
  }
}
