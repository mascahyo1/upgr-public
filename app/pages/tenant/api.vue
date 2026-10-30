<template>
  <div data-testid="page-tenant-api">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">API</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">API Tenant</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Kunci API milik tenant untuk memanggil endpoint UPGR.</p>
    <div class="mt-6 flex flex-wrap gap-2">
      <button type="button" data-testid="api-template-btn" title="Unduh contoh template impor" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="downloadTemplate">
        <i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Template
      </button>
      <button type="button" data-testid="api-import-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="triggerImport">
        <i class="fa-solid fa-file-import mr-1.5" aria-hidden="true"></i>Impor
      </button>
      <input ref="importFile" type="file" data-testid="api-import-file" accept=".xlsx,.xls,.csv" class="hidden" @change="onImportFile" />
      <button type="button" data-testid="api-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportXlsx">
        <i class="fa-solid fa-file-export mr-1.5" aria-hidden="true"></i>Ekspor Excel
      </button>
      <button type="button" data-testid="api-add" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openForm(null)">
        <i class="fa-solid fa-plus mr-1.5" aria-hidden="true"></i>Tambah
      </button>
    </div>

    <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter API">
      <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
        <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
      </p>
      <form data-testid="api-filter-form" @submit.prevent="applyFilter">
        <div class="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label for="api-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
            <input id="api-q" v-model="filter.q" data-testid="api-q" type="search" placeholder="Nama atau tenant ID" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="api-status" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status</label>
            <select id="api-status" v-model="filter.status" data-testid="api-status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button type="button" data-testid="api-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
          <button type="submit" data-testid="api-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
        </div>
      </form>
    </section>

    <div v-if="bulkCount > 0" data-testid="api-bulkbar" class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span><strong data-testid="api-selected-count">{{ bulkCount }}</strong> dipilih</span>
      <button type="button" data-testid="api-bulk-delete" class="rounded-md border border-red-400 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900" @click="openDelete(selectedIds)">Hapus</button>
      <button type="button" data-testid="api-bulk-clear" class="ml-auto underline" @click="clearSelected">Batalkan pilihan</button>
    </div>

    <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Daftar API">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
          <select v-model.number="state.perPage" data-testid="api-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="state.page = 1">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </label>
        <p class="text-xs text-slate-500 dark:text-slate-400">Shift+klik header = multi-sort</p>
        <button type="button" data-testid="api-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="resetSort"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th class="w-10 px-4 py-3"><input v-model="selectAll" type="checkbox" data-testid="api-select-all" aria-label="Pilih semua" class="h-4 w-4" /></th>
              <th class="px-4 py-3"><button type="button" data-testid="api-sort-name" class="font-semibold hover:text-emerald-700" @click="cycleSort('name', $event.shiftKey)">Nama <span data-testid="api-sort-name-ind">{{ sortInd('name') }}</span></button></th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Key</th>
              <th class="px-4 py-3">Secret</th>
              <th class="px-4 py-3"><button type="button" data-testid="api-sort-created" class="font-semibold hover:text-emerald-700" @click="cycleSort('created_at', $event.shiftKey)">Dibuat <span data-testid="api-sort-created-ind">{{ sortInd('created_at') }}</span></button></th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody data-testid="api-rows">
            <tr v-if="pageRows.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ emptyText }}</td>
            </tr>
            <tr v-for="r in pageRows" :key="r.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td class="px-4 py-3"><input v-model="selected[r.id]" type="checkbox" data-testid="api-select" :data-id="r.id" :aria-label="'Pilih ' + r.name" class="h-4 w-4" /></td>
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ r.name }}</td>
              <td class="px-4 py-3"><UiBadge :text="r.status === 'aktif' ? 'Aktif' : 'Nonaktif'" :tone="r.status === 'aktif' ? 'emerald' : 'slate'" /></td>
              <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400" :title="r.key">{{ shortKey(r.key) }}</td>
              <td class="px-4 py-3"><span class="font-mono text-xs tracking-widest">••••••••</span></td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(r.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button type="button" data-testid="api-detail" :data-id="r.id" title="Detail" :aria-label="'Detail ' + r.name" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="detailRow = r"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>
                  <button type="button" data-testid="api-edit" :data-id="r.id" title="Ubah" :aria-label="'Ubah ' + r.name" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openForm(r)"><i class="fa-solid fa-edit" aria-hidden="true"></i></button>
                  <button type="button" data-testid="api-delete" :data-id="r.id" title="Hapus" :aria-label="'Hapus ' + r.name" class="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300" @click="openDelete([r.id])"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination p="api" :page="state.page" :pages="pages" :from="from" :to="to" :total="filtered.length" @prev="state.page--" @next="state.page++" />
    </section>
  </div>

  <UiModal v-if="modalOpen" p="api" :title="editingId ? 'Ubah API' : 'Tambah API'" @close="modalOpen = false" @backdrop="modalOpen = false">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="api-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(formErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(formErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in formErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="api-form" novalidate @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label for="api-name" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama <span class="text-red-500">*</span></label>
            <input id="api-name" v-model="form.name" data-testid="api-name" type="text" maxlength="100" placeholder="mis. ERP Production" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.name }" />
            <p data-testid="api-name-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.name ? '' : 'hidden']">{{ formErrs.name }}</p>
          </div>
          <div>
            <label for="api-status-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status <span class="text-red-500">*</span></label>
            <select id="api-status-input" v-model="form.status" data-testid="api-status-input" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <p data-testid="api-status-input-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.status ? '' : 'hidden']">{{ formErrs.status }}</p>
          </div>
          <div>
            <label for="api-key" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Key <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input id="api-key" v-model="form.key" data-testid="api-key" type="text" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.key }" />
              <button type="button" data-testid="api-key-generate" aria-label="Generate key" title="Generate key" class="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="form.key = randomToken()">
                <i class="fa-solid fa-dice" aria-hidden="true"></i>
              </button>
            </div>
            <p data-testid="api-key-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.key ? '' : 'hidden']">{{ formErrs.key }}</p>
          </div>
          <div>
            <label for="api-secret" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Secret <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input id="api-secret" v-model="form.secret" :type="showSecret ? 'text' : 'password'" data-testid="api-secret" autocomplete="new-password" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.secret }" />
              <button type="button" data-testid="api-show" :aria-label="showSecret ? 'Sembunyikan secret' : 'Tampilkan secret'" class="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="showSecret = !showSecret">
                <i :class="showSecret ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" aria-hidden="true"></i>
              </button>
              <button type="button" data-testid="api-secret-generate" aria-label="Generate secret" title="Generate secret" class="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="form.secret = randomToken()">
                <i class="fa-solid fa-dice" aria-hidden="true"></i>
              </button>
            </div>
            <p data-testid="api-secret-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.secret ? '' : 'hidden']">{{ formErrs.secret }}</p>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="api-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="modalOpen = false">Batal</button>
      <button type="button" data-testid="api-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitForm">Simpan</button>
    </div>
  </UiModal>

  <UiModal v-if="deleteOpen" p="api-delete" title="Hapus API?" max-w="max-w-md" @close="deleteOpen = false" @backdrop="deleteOpen = false">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <p data-testid="api-delete-text" class="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">{{ deleteText }}</p>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="api-delete-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="deleteOpen = false">Batal</button>
      <button type="button" data-testid="api-delete-confirm" class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="confirmDelete">Hapus</button>
    </div>
  </UiModal>

  <UiModal v-if="detailRow" p="api-detail" title="Detail API" max-w="max-w-lg" @close="detailRow = null" @backdrop="detailRow = null">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <dl data-testid="api-detail-body" class="space-y-2 text-sm">
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Nama</dt><dd class="font-medium text-slate-900 dark:text-white">{{ detailRow.name }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Status</dt><dd><UiBadge :text="detailRow.status === 'aktif' ? 'Aktif' : 'Nonaktif'" :tone="detailRow.status === 'aktif' ? 'emerald' : 'slate'" /></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Key</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailRow.key }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Secret</dt><dd class="font-mono text-xs tracking-widest">•••••••• <span class="text-slate-400">(disensor)</span></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Dibuat</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(detailRow.created_at) }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Diubah</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(detailRow.updated_at) }}</dd></div>
      </dl>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="api-detail-close" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="detailRow = null">Tutup</button>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'

definePageMeta({ layout: 'admin' })
useHead({ title: 'API Tenant - UPGR' })

const { toast } = useToast()

interface ApiKey {
  id: string
  tenant_id: string
  name: string
  status: string
  key: string
  secret: string
  created_at: string
  updated_at: string
}

const rows = ref<ApiKey[]>([])
const state = reactive({ q: '', status: '', page: 1, perPage: 10, sorts: [{ key: 'created_at', dir: 'desc' }] as Array<{ key: string, dir: 'asc' | 'desc' }> })
const filter = reactive({ q: '', status: '' })
const selected = reactive<Record<string, boolean>>({})
const selectAll = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deletingIds = ref<string[]>([])
const detailRow = ref<ApiKey | null>(null)
const showSecret = ref(false)
const form = reactive({ name: '', status: 'aktif', key: '', secret: '' })
const formErrs = reactive<Record<string, string>>({})
const importFile = ref<HTMLInputElement | null>(null)

const emptyText = computed(() => {
  if (rows.value.length === 0 && !state.q && !state.status) return 'Belum ada kunci API. Tambahkan kunci pertama.'
  return 'Tidak ada hasil. Ubah filter atau tambah kunci baru.'
})

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

function shortKey(k: string) {
  const s = String(k || '')
  return s.length > 18 ? s.slice(0, 18) + '…' : s
}

function randomToken() {
  const hex = '0123456789abcdef'
  let out = ''
  try {
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    for (const b of buf) out += (hex[b >> 4] ?? '') + (hex[b & 15] ?? '')
  } catch {
    for (let i = 0; i < 32; i++) out += hex[Math.floor(Math.random() * 16)] ?? ''
  }
  return out
}

async function load() {
  const res = await $fetch<{ data: ApiKey[] }>('/api_web/tenant/api-keys')
  rows.value = res.data
}

const filtered = computed(() => {
  const s = state.q.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (state.status && r.status !== state.status) return false
    if (s && (r.name + ' ' + r.tenant_id).toLowerCase().indexOf(s) < 0) return false
    return true
  })
})

const sorted = computed(() => {
  const sorts = state.sorts
  return filtered.value.slice().sort((a, b) => {
    for (const srt of sorts) {
      const av = String((a as any)[srt.key] ?? '').toLowerCase()
      const bv = String((b as any)[srt.key] ?? '').toLowerCase()
      if (av < bv) return srt.dir === 'asc' ? -1 : 1
      if (av > bv) return srt.dir === 'asc' ? 1 : -1
    }
    return 0
  })
})

const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / state.perPage)))
const from = computed(() => filtered.value.length === 0 ? 0 : (state.page - 1) * state.perPage + 1)
const to = computed(() => Math.min(state.page * state.perPage, filtered.value.length))
const pageRows = computed(() => {
  if (state.page > pages.value) state.page = pages.value
  return sorted.value.slice((state.page - 1) * state.perPage, state.page * state.perPage)
})

const selectedIds = computed(() => Object.keys(selected).filter(k => selected[k] && rows.value.some(r => r.id === k)))
const bulkCount = computed(() => selectedIds.value.length)

watch(selectAll, (v) => {
  for (const r of pageRows.value) selected[r.id] = v
})

function clearSelected() {
  for (const k of Object.keys(selected)) delete selected[k]
  selectAll.value = false
}

function applyFilter() {
  state.q = filter.q
  state.status = filter.status
  state.page = 1
  clearSelected()
}

function resetFilter() {
  filter.q = ''
  filter.status = ''
  state.q = ''
  state.status = ''
  state.page = 1
  clearSelected()
}

function cycleSort(key: string, additive: boolean) {
  const idx = state.sorts.findIndex(s => s.key === key)
  const cur = idx >= 0 ? state.sorts[idx] : undefined
  if (!additive) {
    let dir: 'asc' | 'desc' = 'asc'
    if (idx === 0 && state.sorts.length === 1) dir = state.sorts[0]?.dir === 'asc' ? 'desc' : 'asc'
    else if (cur) dir = cur.dir === 'asc' ? 'desc' : 'asc'
    state.sorts = [{ key, dir }]
  } else {
    if (cur) cur.dir = cur.dir === 'asc' ? 'desc' : 'asc'
    else state.sorts.push({ key, dir: 'asc' })
  }
  state.page = 1
}

function sortInd(key: string) {
  const i = state.sorts.findIndex(s => s.key === key)
  if (i < 0) return ''
  return (state.sorts[i]?.dir === 'asc' ? '▲' : '▼') + (state.sorts.length > 1 ? String(i + 1) : '')
}

function resetSort() {
  state.sorts = [{ key: 'created_at', dir: 'desc' }]
  state.page = 1
}

function validateLocal() {
  const e: Record<string, string> = {}
  const name = form.name.trim()
  if (!name) e.name = 'Nama wajib diisi.'
  else if (name.length > 100) e.name = 'Nama maksimal 100 karakter.'
  if (form.status !== 'aktif' && form.status !== 'nonaktif') e.status = 'Status tidak valid.'
  const key = form.key.trim()
  if (!key) e.key = 'Key wajib diisi.'
  else if (key.length < 4) e.key = 'Key minimal 4 karakter.'
  else if (key.length > 200) e.key = 'Key maksimal 200 karakter.'
  if (!form.secret) e.secret = 'Secret wajib diisi.'
  else if (form.secret.length < 4) e.secret = 'Secret minimal 4 karakter.'
  else if (form.secret.length > 200) e.secret = 'Secret maksimal 200 karakter.'
  return e
}

function openForm(row: ApiKey | null) {
  editingId.value = row ? row.id : null
  form.name = row?.name || ''
  form.status = row?.status || 'aktif'
  form.key = row?.key || randomToken()
  form.secret = row?.secret || randomToken()
  showSecret.value = false
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  modalOpen.value = true
}

async function submitForm() {
  const errs = validateLocal()
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  Object.assign(formErrs, errs)
  if (Object.keys(errs).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  try {
    const payload = { name: form.name.trim(), status: form.status, key: form.key.trim(), secret: form.secret }
    if (editingId.value) await $fetch(`/api_web/tenant/api-keys/${editingId.value}`, { method: 'PUT', body: payload })
    else await $fetch('/api_web/tenant/api-keys', { method: 'POST', body: payload })
    toast('API tersimpan.')
    modalOpen.value = false
    await load()
  } catch (err: any) {
    const serverErrs = err?.data?.data?.errors
    if (serverErrs) {
      Object.assign(formErrs, serverErrs)
      toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    } else {
      toast('Gagal menyimpan: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
  }
}

function openDelete(ids: string[]) {
  deletingIds.value = ids.slice()
  deleteOpen.value = true
}

const deleteText = computed(() => {
  const names = deletingIds.value.map(id => rows.value.find(r => r.id === id)?.name || id)
  return deletingIds.value.length === 1
    ? `Hapus API "${names[0]}"? Tindakan ini tidak dapat dibatalkan.`
    : `Hapus ${deletingIds.value.length} API (${names.slice(0, 3).join(', ')}${names.length > 3 ? ', …' : ''})? Tindakan ini tidak dapat dibatalkan.`
})

async function confirmDelete() {
  try {
    if (deletingIds.value.length === 1) {
      await $fetch(`/api_web/tenant/api-keys/${deletingIds.value[0]}`, { method: 'DELETE' })
      toast('API terhapus.')
    } else {
      const res = await $fetch<{ data: { diproses: number, dilewati: number } }>('/api_web/tenant/api-keys/bulk-delete', { method: 'POST', body: { ids: deletingIds.value } })
      toast(res.data.dilewati ? `Terhapus ${res.data.diproses}, dilewati ${res.data.dilewati} (tidak ditemukan).` : `Terhapus ${res.data.diproses} API.`)
    }
    clearSelected()
    deleteOpen.value = false
    await load()
  } catch (err: any) {
    toast('Gagal menghapus: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

function stamp() {
  const d = new Date()
  const p = (n: number) => (n < 10 ? '0' : '') + n
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

async function exportXlsx() {
  const data = sorted.value.map(r => ({ Nama: r.name, 'Tenant ID': r.tenant_id, Status: r.status, Key: r.key, Secret: r.secret, Dibuat: fmtDate(r.created_at) }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Nama: '', 'Tenant ID': '', Status: '', Key: '', Secret: '', Dibuat: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'API')
  XLSX.writeFile(wb, `api-${stamp()}.xlsx`)
  toast(`Diekspor ${data.length} API ke Excel.`)
}

function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Nama', 'Tenant ID', 'Status', 'Key', 'Secret'],
    ['ERP Production', '01a18296-88bb-7cd3-888e-b69cb5214659', 'aktif', 'upgrk_erp_prod_001', 'upgrs_erp_prod_001'],
    ['BIS Staging', '01a18296-88bb-7cd3-888e-b69cb5214659', 'nonaktif', 'upgrk_bis_stg_001', 'upgrs_bis_stg_001']
  ]), 'API')
  XLSX.writeFile(wb, 'template-api.xlsx')
  toast('Template impor API diunduh.')
}

function triggerImport() {
  importFile.value?.click()
}

function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const wb = XLSX.read(reader.result, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0] ?? '']
      if (!sheet) { toast('Lembar kerja tidak ditemukan.', 'error'); return }
      const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as string[][]
      if (!aoa.length) { toast('Berkas kosong.', 'error'); return }
      const head = (aoa[0] ?? []).map(h => String(h).trim().toLowerCase())
      const col = (...names: string[]) => {
        for (const n of names) { const i = head.indexOf(n); if (i >= 0) return i }
        return -1
      }
      const iNama = col('nama', 'name')
      const iTid = col('tenant id', 'tenant')
      const iStatus = col('status')
      const iKey = col('key')
      const iSecret = col('secret')
      if (iNama < 0 || iKey < 0 || iSecret < 0) { toast('Header tidak dikenali. Butuh kolom Nama, Key, Secret.', 'error'); return }
      const rowsIn = aoa.slice(1).map((line) => {
        const cell = (j: number) => String(line[j] ?? '')
        return {
          name: cell(iNama),
          tenant_id: iTid >= 0 && cell(iTid).trim() !== '' ? cell(iTid) : '01a18296-88bb-7cd3-888e-b69cb5214659',
          status: iStatus >= 0 && cell(iStatus).trim().toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
          key: cell(iKey),
          secret: cell(iSecret)
        }
      })
      const res = await $fetch<{ data: { ditambah: number, dilewati: number } }>('/api_web/tenant/api-keys/bulk-import', { method: 'POST', body: { rows: rowsIn } })
      toast(res.data.dilewati ? `Impor selesai: ${res.data.ditambah} ditambah, ${res.data.dilewati} dilewati.` : `Impor selesai: ${res.data.ditambah} ditambah.`)
      state.page = 1
      await load()
    } catch (err: any) {
      toast('Gagal mengimpor: ' + (err?.message || 'berkas tidak valid'), 'error')
    }
  }
  reader.readAsArrayBuffer(file)
}

await load()
</script>
