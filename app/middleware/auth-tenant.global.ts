// Middleware sesi portal tenant (global: jalan tiap navigasi, keluar cepat
// bila bukan rute tenant). /tenant/* (kecuali login/lupa-password) wajib sesi
// area tenant; tanpa sesi / area salah -> redirect /tenant/login. Dicek
// server-side (cookie header) maupun client-side, jadi reload dengan sesi
// kedaluwarsa langsung ke login, bukan toast di halaman.
export default defineNuxtRouteMiddleware(async (to) => {
  const path = to.path || '/'
  if (!path.startsWith('/tenant/')) return
  if (path === '/tenant/login' || path === '/tenant/lupa-password') return
  try {
    let me: any
    if (import.meta.server) {
      const cookie = useRequestHeaders(['cookie']).cookie ?? ''
      me = await $fetch<{ data: { area: string } }>('/api_web/auth/me', { headers: { cookie } })
    } else {
      me = await $fetch<{ data: { area: string } }>('/api_web/auth/me')
    }
    if (me?.data?.area === 'tenant') return
  } catch { /* jatuh ke redirect login */ }
  return navigateTo('/tenant/login')
})
