<!-- Sumber struktur & perilaku: C:\Users\masca\upgr\server.js fungsi layoutAdmin
     + PROVIDER_MENU (tanpa profileHref -> default '/profil' / 'Ubah profil').
     DIMODIFIKASI: sama seperti layouts/admin.vue (state reaktif, NuxtLink, useTheme). -->
<template>
  <div class="min-h-screen bg-slate-100 text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
    <div id="admin-backdrop" data-testid="admin-backdrop" :class="['fixed inset-0 z-30 bg-slate-900/50', drawer ? '' : 'hidden']" @click="closeMobile"></div>
    <aside id="admin-sidebar" data-testid="admin-sidebar" aria-label="Menu area" :class="asideClasses">
      <div class="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
          <i class="fa-solid fa-arrows-split-up-and-left" aria-hidden="true"></i>
        </span>
        <span class="menu-label whitespace-nowrap text-base font-bold text-slate-900 dark:text-white">UPGR Provider</span>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigasi area">
        <NuxtLink
          v-for="item in menu"
          :key="item.href"
          :to="item.href"
          :data-testid="`admin-menu-${item.slug}`"
          :class="['flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium', isActive(item.href) ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800']"
        >
          <i :class="`${item.icon} w-5 shrink-0 text-center`" aria-hidden="true"></i>
          <span class="menu-label whitespace-nowrap">{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
        <NuxtLink to="/" class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <i class="fa-solid fa-globe w-5 shrink-0 text-center" aria-hidden="true"></i>
          <span class="menu-label whitespace-nowrap">Lihat Situs</span>
        </NuxtLink>
      </div>
    </aside>
    <div id="admin-main" :class="['min-h-screen', mainClass]">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          id="admin-toggle"
          data-testid="admin-toggle"
          aria-label="Alihkan sidebar"
          :aria-expanded="mode === 'hidden' ? 'false' : 'true'"
          class="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="onToggle"
        >
          <i id="admin-toggle-icon" :class="`${toggleIcon} text-lg`" aria-hidden="true"></i>
        </button>
        <div class="relative">
          <button
            type="button"
            id="admin-user-btn"
            data-testid="admin-user"
            aria-haspopup="true"
            :aria-expanded="userOpen ? 'true' : 'false'"
            class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            @click.stop="userOpen = !userOpen"
          >
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white">
              <i class="fa-solid fa-user" aria-hidden="true"></i>
            </span>
            <i class="fa-solid fa-chevron-down text-xs text-slate-500 dark:text-slate-400" aria-hidden="true"></i>
          </button>
          <div
            id="admin-user-menu"
            data-testid="admin-user-menu"
            role="menu"
            :class="['absolute right-0 z-20 mt-1 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900', userOpen ? '' : 'hidden']"
          >
            <a href="/profil" role="menuitem" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              <i class="fa-solid fa-id-card w-4 text-center" aria-hidden="true"></i><span>Ubah profil</span>
            </a>
            <button
              type="button"
              id="admin-theme-btn"
              data-testid="admin-theme"
              role="menuitem"
              class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="onTheme"
            >
              <i class="fa-solid fa-moon w-4 text-center" aria-hidden="true"></i><span>{{ dark ? 'Mode gelap: menyala' : 'Mode gelap: mati' }}</span>
            </button>
            <hr class="my-1 border-slate-200 dark:border-slate-700" />
            <a href="/" role="menuitem" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
              <i class="fa-solid fa-right-from-bracket w-4 text-center" aria-hidden="true"></i><span>Keluar</span>
            </a>
          </div>
        </div>
      </header>
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8"><slot /></main>
    </div>
    <UiToasts />
  </div>
</template>

<script setup lang="ts">
// Sumber perilaku: C:\Users\masca\upgr\server.js layoutAdmin <script>.
// DIMODIFIKASI: classList imperative -> ref reaktif (mode, drawer, desktop, userOpen).
const route = useRoute()
const { dark, toggleTheme, initTheme } = useTheme()

const menu = [
  { href: '/provider/beranda', slug: 'beranda', label: 'Beranda', icon: 'fa-solid fa-house' },
  { href: '/provider/dashboard', slug: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
  { href: '/provider/tenant', slug: 'tenant', label: 'Tenant', icon: 'fa-solid fa-store' },
  { href: '/provider/konfigurasi', slug: 'konfigurasi', label: 'Konfigurasi', icon: 'fa-solid fa-gear' }
]

function isActive(href: string) {
  return route.path === href || (href === '/provider/tenant' && route.path.startsWith('/provider/tenant/'))
}

type SidebarMode = 'expanded' | 'collapsed' | 'hidden'
const mode = ref<SidebarMode>('expanded')
const drawer = ref(false)
const desktop = ref(false)
const userOpen = ref(false)

const asideClasses = computed(() => {
  const base = ['fixed', 'inset-y-0', 'left-0', 'z-40', 'flex', 'w-60', 'flex-col', 'border-r', 'border-slate-200', 'bg-white', 'transition-[width,transform]', 'duration-200', 'dark:border-slate-800', 'dark:bg-slate-900']
  if (desktop.value) {
    if (mode.value === 'collapsed') return [...base, 'lg:w-[72px]', 'lg:translate-x-0', 'admin-collapsed']
    if (mode.value === 'hidden') return [...base, '-translate-x-full', 'lg:-translate-x-full']
    return [...base, 'lg:translate-x-0']
  }
  return [...base, ...(drawer.value ? [] : ['-translate-x-full'])]
})

const mainClass = computed(() => {
  if (!desktop.value) return ''
  if (mode.value === 'collapsed') return 'lg:pl-[72px]'
  if (mode.value === 'hidden') return ''
  return 'lg:pl-60'
})

const toggleIcon = computed(() => {
  if (mode.value === 'hidden') return 'fa-solid fa-bars'
  if (mode.value === 'collapsed') return 'fa-solid fa-angles-right'
  return 'fa-solid fa-angles-left'
})

function persistMode() {
  try { localStorage.setItem('upgr-sidebar', mode.value) } catch {}
}

function closeMobile() {
  drawer.value = false
}

function onToggle() {
  if (!desktop.value) {
    drawer.value = !drawer.value
    return
  }
  mode.value = mode.value === 'expanded' ? 'collapsed' : mode.value === 'collapsed' ? 'hidden' : 'expanded'
  persistMode()
}

function closeUser() {
  userOpen.value = false
}

function onTheme() {
  toggleTheme()
  closeUser()
}

function detectDesktop() {
  desktop.value = window.innerWidth >= 1024
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    detectDesktop()
    if (!desktop.value) closeMobile()
  }, 100)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { closeUser(); closeMobile() }
}

function onDocClick() {
  closeUser()
}

onMounted(() => {
  initTheme()
  let stored: string | null = null
  try { stored = localStorage.getItem('upgr-sidebar') } catch {}
  if (stored === 'collapsed' || stored === 'hidden') mode.value = stored
  detectDesktop()
  if (!desktop.value) closeMobile()
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>
