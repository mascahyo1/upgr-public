<template>
  <div class="flex min-h-screen flex-col bg-white text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <NuxtLink to="/" class="flex shrink-0 items-center gap-2" title="UPGR - Unified Payment Gateway Router">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <i class="fa-solid fa-arrows-split-up-and-left" aria-hidden="true"></i>
          </span>
          <span class="whitespace-nowrap text-base font-bold text-slate-900 dark:text-white">UPGR</span>
        </NuxtLink>
        <div ref="navRow" data-testid="nav-desktop-row" class="flex min-w-0 flex-1 items-center justify-start gap-2 overflow-hidden">
          <nav ref="navBox" data-testid="nav-desktop" class="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden" aria-label="Navigasi utama">
            <NuxtLink
              v-for="item in NAV"
              :key="item.href"
              :to="item.href"
              :data-testid="`nav-desktop-${slug(item.href)}`"
              data-greedy="1"
              :class="[deskCls(item.href), hiddenSet.has(keyOf(item.href)) ? 'hidden' : '']"
            >
              <i :class="`${item.icon} w-4 shrink-0 text-center`" aria-hidden="true"></i><span>{{ item.label }}</span>
            </NuxtLink>
          </nav>
          <span v-show="showSep" id="nav-sep" class="h-6 w-px shrink-0 bg-slate-200 dark:bg-slate-700" aria-hidden="true"></span>
          <NuxtLink
            to="/tenant/login"
            data-testid="nav-login-tenant"
            data-greedy="2"
            :class="['shrink-0 whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800', hiddenSet.has('login-tenant') ? 'hidden' : '']"
          >
            <i class="fa-solid fa-user mr-1.5" aria-hidden="true"></i>Login Tenant
          </NuxtLink>
          <NuxtLink
            to="/provider/login"
            data-testid="nav-login-provider"
            data-greedy="2"
            :class="['shrink-0 whitespace-nowrap rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200', hiddenSet.has('login-provider') ? 'hidden' : '']"
          >
            <i class="fa-solid fa-user-gear mr-1.5" aria-hidden="true"></i>Login Provider
          </NuxtLink>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <button
            type="button"
            data-testid="nav-theme"
            :aria-label="dark ? 'Mode terang' : 'Mode gelap'"
            :title="dark ? 'Mode terang' : 'Mode gelap'"
            class="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="toggleTheme"
          >
            <i :class="dark ? 'fa-solid fa-sun text-lg' : 'fa-solid fa-moon text-lg'" aria-hidden="true"></i>
          </button>
          <button
            v-show="drawerNeeded"
            type="button"
            data-testid="nav-toggle"
            aria-label="Buka menu navigasi"
            :aria-expanded="drawerOpen ? 'true' : 'false'"
            aria-controls="nav-drawer"
            class="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="drawerOpen = true"
          >
            <i class="fa-solid fa-bars text-lg" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div v-show="drawerOpen" data-testid="nav-backdrop" class="fixed inset-0 z-30 bg-slate-900/50" @click="drawerOpen = false"></div>
      <aside
        v-show="drawerOpen"
        data-testid="nav-drawer"
        aria-label="Menu navigasi"
        class="fixed inset-y-0 right-0 z-40 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-slate-950"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <p class="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <i class="fa-solid fa-arrows-split-up-and-left text-xs" aria-hidden="true"></i>
            </span>
            UPGR
          </p>
          <button type="button" data-testid="nav-close" aria-label="Tutup menu navigasi" class="rounded-md p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800" @click="drawerOpen = false">
            <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
          </button>
        </div>
        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigasi seluler">
          <NuxtLink
            v-for="item in NAV"
            :key="'d' + item.href"
            :to="item.href"
            :data-testid="`nav-drawer-${slug(item.href)}`"
            :class="['flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium', isActive(item.href) ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800']"
            @click="drawerOpen = false"
          >
            <i :class="`${item.icon} w-4 shrink-0 text-center`" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </NuxtLink>
          <hr class="my-2 border-slate-200 dark:border-slate-800" />
          <NuxtLink
            v-for="item in LOGIN_ITEMS"
            :key="'l' + item.href"
            :to="item.href"
            :data-testid="`nav-drawer-${slug(item.href)}`"
            :class="['flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium', isActive(item.href) ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800']"
            @click="drawerOpen = false"
          >
            <i :class="`${item.icon} w-4 shrink-0 text-center`" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </NuxtLink>
          <hr class="my-2 border-slate-200 dark:border-slate-800" />
          <NuxtLink
            v-for="item in AREA_LINKS"
            :key="'a' + item.href"
            :to="item.href"
            :data-testid="`nav-drawer-${slug(item.href)}`"
            :class="['flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium', isActive(item.href) ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800']"
            @click="drawerOpen = false"
          >
            <i :class="`${item.icon} w-4 shrink-0 text-center`" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </aside>
    </header>
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-12">
      <slot />
    </main>
    <footer class="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p class="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <i class="fa-solid fa-arrows-split-up-and-left text-xs" aria-hidden="true"></i>
            </span>
            UPGR
          </p>
          <p class="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">Unified Payment Gateway Router. Satu webhook gateway diteruskan ke banyak tenant melalui antrian dengan retry dan idempotency key.</p>
        </div>
        <nav aria-label="Navigasi footer">
          <p class="font-semibold text-slate-900 dark:text-white">Navigasi</p>
          <ul class="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
            <li v-for="item in NAV" :key="'f' + item.href"><NuxtLink class="hover:text-emerald-700" :to="item.href">{{ item.label }}</NuxtLink></li>
          </ul>
        </nav>
        <div>
          <p class="font-semibold text-slate-900 dark:text-white">Hubungi Kami</p>
          <ul class="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
            <li><i class="fa-solid fa-globe mr-1.5 text-emerald-700" aria-hidden="true"></i><span class="font-mono text-[13px]">upgr.example.com</span></li>
            <li><i class="fa-solid fa-flask mr-1.5 text-emerald-700" aria-hidden="true"></i><span class="font-mono text-[13px]">dev-upgr.example.com</span></li>
            <li><NuxtLink class="hover:text-emerald-700" to="/hubungi-kami"><i class="fa-solid fa-envelope mr-1.5" aria-hidden="true"></i>Kontak selengkapnya</NuxtLink></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-200 dark:border-slate-800">
        <p class="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400">&copy; {{ year }} UPGR. Seluruh hak cipta dilindungi undang-undang.</p>
      </div>
    </footer>
    <UiToasts />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { dark, toggleTheme, initTheme } = useTheme()

const NAV = [
  { href: '/', label: 'Beranda', icon: 'fa-solid fa-house' },
  { href: '/tentang-kami', label: 'Tentang Kami', icon: 'fa-solid fa-circle-info' },
  { href: '/syarat-ketentuan', label: 'Syarat & Ketentuan', icon: 'fa-solid fa-file-lines' },
  { href: '/kebijakan-privasi', label: 'Kebijakan Privasi', icon: 'fa-solid fa-shield-halved' },
  { href: '/hubungi-kami', label: 'Hubungi Kami', icon: 'fa-solid fa-envelope' }
]
const LOGIN_ITEMS = [
  { href: '/tenant/login', label: 'Login Tenant', icon: 'fa-solid fa-user' },
  { href: '/provider/login', label: 'Login Provider', icon: 'fa-solid fa-user-gear' }
]
const AREA_LINKS = [
  { href: '/provider/beranda', label: 'Beranda Provider', icon: 'fa-solid fa-briefcase' },
  { href: '/tenant/beranda', label: 'Beranda Tenant', icon: 'fa-solid fa-house' },
  { href: '/tenant/dashboard', label: 'Dashboard Tenant', icon: 'fa-solid fa-store' },
  { href: '/tenant/payment-gateway-credential', label: 'Kredensial Gateway', icon: 'fa-solid fa-key' }
]

const year = new Date().getFullYear()
const drawerOpen = ref(false)
const drawerNeeded = ref(false)
const showSep = ref(true)
const hiddenSet = ref<Set<string>>(new Set())

const navRow = ref<HTMLElement | null>(null)
const navBox = ref<HTMLElement | null>(null)

function slug(href: string) {
  return href === '/' ? 'home' : href.slice(1)
}
function keyOf(href: string) {
  return slug(href).replaceAll('/', '-')
}
function isActive(href: string) {
  return route.path === href
}
function deskCls(href: string) {
  return `flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive(href) ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`
}

const HIDE_ORDER = ['login-provider', 'login-tenant', 'hubungi-kami', 'kebijakan-privasi', 'syarat-ketentuan', 'tentang-kami', 'home']

async function updateNav() {
  const row = navRow.value
  const nav = navBox.value
  if (!row || !nav) return
  hiddenSet.value = new Set()
  showSep.value = true
  drawerNeeded.value = false
  await nextTick()
  const need = () => {
    let w = 0
    const kids = Array.from(row.children) as HTMLElement[]
    for (const c of kids) {
      if (c.classList.contains('hidden')) continue
      w += c === nav ? (c as HTMLElement).scrollWidth : c.getBoundingClientRect().width
    }
    return w + 8 * (kids.length - 1)
  }
  let n = 0
  while (n < HIDE_ORDER.length && need() > row.clientWidth + 1) {
    const key = HIDE_ORDER[n]
    if (key === undefined) break
    hiddenSet.value = new Set(hiddenSet.value).add(key)
    n++
    await nextTick()
  }
  const visibleLinks = nav.querySelectorAll('a:not(.hidden)').length
  showSep.value = visibleLinks > 0
  drawerNeeded.value = n > 0
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(updateNav, 100)
}

watch(() => route.path, () => { drawerOpen.value = false })

onMounted(() => {
  initTheme()
  updateNav()
  window.addEventListener('resize', onResize)
  if (document.fonts?.ready) document.fonts.ready.then(updateNav)
  window.addEventListener('load', updateNav)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})
</script>
