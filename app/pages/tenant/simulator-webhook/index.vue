<template>
  <div data-testid="page-sim">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700">Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Simulator Webhook</li>
      </ol>
    </nav>

    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Simulator Webhook</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Penampung gratis milik sendiri, terisolasi per tenant (pengganti webhook.site). Pasang URL di bawah sebagai URL webhook, lalu setiap penerusan tercatat di sini. Tanpa login untuk mengirim, perlu login untuk melihat.</p>

    <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="URL penampung">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <p class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <i class="fa-solid fa-satellite-dish text-emerald-700" aria-hidden="true"></i>URL penampung saya
        </p>
        <button type="button" data-testid="sim-copy" class="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="copyUrl">
          <i class="fa-solid fa-copy mr-1" aria-hidden="true"></i>{{ copied ? 'Disalin!' : 'Salin' }}
        </button>
      </div>
      <div class="px-5 py-4">
        <code data-testid="sim-url" class="block break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-200">{{ catcherUrl || 'Memuat…' }}</code>
      </div>
    </section>

    <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter">
      <div class="border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <p class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
        </p>
      </div>
      <form data-testid="sim-filter-form" @submit.prevent="applyFilter">
        <div class="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label for="sim-dari" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal dari</label>
            <input id="sim-dari" v-model="filter.dari" data-testid="sim-dari" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="sim-sampai" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal sampai</label>
            <input id="sim-sampai" v-model="filter.sampai" data-testid="sim-sampai" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
        </div>
        <div class="flex justify-end gap-2 px-5 pb-5">
          <button type="button" data-testid="sim-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetFilter">Reset</button>
          <button type="submit" data-testid="sim-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">Filter</button>
        </div>
      </form>
    </section>

    <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Hasil tangkapan">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <p class="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <i class="fa-solid fa-inbox text-emerald-700" aria-hidden="true"></i>Ditangkap (<span data-testid="sim-count">{{ filtered.length }}</span>)
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <label class="text-xs text-slate-500 dark:text-slate-400" for="sim-perpage">Baris</label>
          <select id="sim-perpage" v-model.number="state.perPage" data-testid="sim-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
          <span class="text-xs text-slate-500 dark:text-slate-400">Shift+klik header = multi-sort</span>
          <button type="button" data-testid="sim-sort-reset" title="Reset sorting" aria-label="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetSort">
            <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i>
          </button>
          <button type="button" data-testid="sim-refresh" class="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="load">
            <i class="fa-solid fa-rotate mr-1" aria-hidden="true"></i>Muat ulang
          </button>
          <button type="button" data-testid="sim-clear" class="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950" @click="clearAll">
            <i class="fa-solid fa-trash mr-1" aria-hidden="true"></i>Kosongkan
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <td class="px-4 py-3"><button type="button" data-testid="sim-sort-created" class="font-semibold hover:text-emerald-700" @click="cycleSort">Waktu <span data-testid="sim-sort-created-ind">{{ sortInd }}</span></button></td>
              <th class="px-4 py-3">IP pengirim</th>
              <th class="px-4 py-3">Respons</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody data-testid="sim-rows">
            <tr v-if="paged.length === 0">
              <td colspan="4" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                <i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ rows.length === 0 ? 'Belum ada tangkapan. Kirim POST ke URL penampung.' : 'Tidak ada baris yang cocok dengan filter.' }}
              </td>
            </tr>
            <tr v-for="r in paged" :key="r.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(r.created_at) }}</td>
              <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ r.ip || '-' }}</td>
              <td class="px-4 py-3"><UiBadge :text="String(r.response_status || 0)" :tone="r.response_status === 201 ? 'emerald' : 'red'" /></td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/tenant/simulator-webhook/${r.id}`" data-testid="sim-detail" :data-id="r.id" title="Detail" aria-label="Detail tangkapan" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                  <i class="fa-solid fa-eye" aria-hidden="true"></i>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-800">
        <p class="text-xs text-slate-500 dark:text-slate-400">Menampilkan {{ from }}–{{ to }} dari {{ filtered.length }}</p>
        <UiPagination p="sim" :page="state.page" :pages="pages" :from="from" :to="to" :total="filtered.length" @prev="state.page--" @next="state.page++" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface SimRow {
  id: string
  tenant_id: string
  ip: string
  request_header: string
  request_body: string
  response_status: number
  response_header: string
  response_body: string
  created_at: string
}

const { toast } = useToast()
const rows = ref<SimRow[]>([])
const copied = ref(false)
const tenantId = ref('')
const filter = reactive({ dari: '', sampai: '' })
const state = reactive({ dari: '', sampai: '', page: 1, perPage: 10, dir: 'desc' as 'asc' | 'desc' })

const catcherUrl = computed(() => tenantId.value ? `${useRequestURL().origin}/api_external/publik/simulator/terima/${tenantId.value}` : '')
const scopeUrl = computed(() => tenantId.value ? `/api_external/publik/simulator/terima/${tenantId.value}` : '')

const filtered = computed(() => {
  return rows.value.filter((r) => {
    const day = String(r.created_at || '').slice(0, 10)
    if (state.dari && day < state.dari) return false
    if (state.sampai && day > state.sampai) return false
    return true
  })
})
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / state.perPage)))
const from = computed(() => filtered.value.length === 0 ? 0 : (state.page - 1) * state.perPage + 1)
const to = computed(() => Math.min(state.page * state.perPage, filtered.value.length))
const paged = computed(() => {
  const list = filtered.value.slice().sort((a, b) => {
    if (a.created_at < b.created_at) return state.dir === 'asc' ? -1 : 1
    if (a.created_at > b.created_at) return state.dir === 'asc' ? 1 : -1
    return 0
  })
  if (state.page > pages.value) state.page = pages.value
  return list.slice((state.page - 1) * state.perPage, state.page * state.perPage)
})
const sortInd = computed(() => state.dir === 'asc' ? '↑' : '↓')

function cycleSort() {
  state.dir = state.dir === 'asc' ? 'desc' : 'asc'
  state.page = 1
}
function resetSort() {
  state.dir = 'desc'
  state.page = 1
}
function applyFilter() {
  state.dari = filter.dari
  state.sampai = filter.sampai
  state.page = 1
}
function resetFilter() {
  filter.dari = ''
  filter.sampai = ''
  state.dari = ''
  state.sampai = ''
  state.page = 1
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch { return iso }
}

async function init() {
  try {
    const res = await $fetch<{ data: { tenant_id: string } }>('/api_external/publik/simulator/milik')
    tenantId.value = res.data.tenant_id
    await load()
  } catch (err: any) {
    toast('Gagal memuat: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

async function load() {
  if (!scopeUrl.value) return
  try {
    const res = await $fetch<{ data: SimRow[] }>(scopeUrl.value)
    rows.value = res.data
  } catch (err: any) {
    toast('Gagal memuat: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

async function clearAll() {
  if (!scopeUrl.value) return
  try {
    await $fetch(scopeUrl.value, { method: 'DELETE' })
    toast('Tangkapan dikosongkan.')
    await load()
  } catch (err: any) {
    toast('Gagal mengosongkan: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(catcherUrl.value)
    copied.value = true
    toast('URL disalin.')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    toast('Gagal menyalin.', 'error')
  }
}

onMounted(init)
</script>
