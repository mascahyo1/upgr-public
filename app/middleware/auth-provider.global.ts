// Middleware sesi portal provider (global: jalan tiap navigasi, keluar cepat
// bila bukan rute provider). /provider/* (kecuali login/lupa-password) wajib
// sesi area provider; tanpa sesi / area salah -> redirect /provider/login.
export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path || '/'
  if (!path.startsWith('/provider/')) return
  if (path === '/provider/login' || path === '/provider/lupa-password') return
  try {
    let me: any
    if (import.meta.server) {
      const cookie = useRequestHeaders(['cookie']).cookie ?? ''
      me = await $fetch<{ data: { area: string } }>('/api_web/auth/me', { headers: { cookie } })
    } else {
      me = await $fetch<{ data: { area: string } }>('/api_web/auth/me')
    }
    if (me?.data?.area === 'provider') return
  } catch { /* jatuh ke redirect login */ }
  return navigateTo('/provider/login')
})
