<template>
  <div data-testid="page-provider-tenant">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/provider/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Provider</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Tenant</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Tenant</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Kelola tenant yang memakai gateway UPGR.</p>
    <div class="mt-6 flex flex-wrap gap-2">
      <button type="button" data-testid="tenant-template-btn" title="Unduh contoh template impor" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="downloadTemplate">
        <i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Template
      </button>
      <button type="button" data-testid="tenant-import-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="triggerImport">
        <i class="fa-solid fa-file-import mr-1.5" aria-hidden="true"></i>Impor
      </button>
      <input ref="importFile" type="file" data-testid="tenant-import-file" accept=".xlsx,.xls,.csv" class="hidden" @change="onImportFile" />
      <button type="button" data-testid="tenant-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportXlsx">
        <i class="fa-solid fa-file-export mr-1.5" aria-hidden="true"></i>Ekspor Excel
      </button>
      <button type="button" data-testid="tenant-add" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openForm(null)">
        <i class="fa-solid fa-plus mr-1.5" aria-hidden="true"></i>Tambah
      </button>
    </div>

    <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter tenant">
      <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
        <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
      </p>
      <form data-testid="tenant-filter-form" @submit.prevent="applyFilter">
        <div class="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <label for="tenant-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
            <input id="tenant-q" v-model="filter.q" data-testid="tenant-q" type="search" placeholder="Nama atau email" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="tenant-status" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status</label>
            <select id="tenant-status" v-model="filter.status" data-testid="tenant-status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button type="button" data-testid="tenant-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
          <button type="submit" data-testid="tenant-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
        </div>
      </form>
    </section>

    <div v-if="bulkCount > 0" data-testid="tenant-bulkbar" class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span><strong data-testid="tenant-selected-count">{{ bulkCount }}</strong> dipilih</span>
      <button type="button" data-testid="tenant-bulk-activate" class="rounded-md border border-emerald-400 px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900" @click="bulkStatus('aktif')">Aktifkan</button>
      <button type="button" data-testid="tenant-bulk-deactivate" class="rounded-md border border-slate-400 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" @click="bulkStatus('nonaktif')">Nonaktifkan</button>
      <button type="button" data-testid="tenant-bulk-delete" class="rounded-md border border-red-400 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900" @click="openDelete(selectedIds)">Hapus</button>
      <button type="button" data-testid="tenant-bulk-clear" class="ml-auto underline" @click="clearSelected">Batalkan pilihan</button>
    </div>

    <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Daftar tenant">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
          <select v-model.number="state.perPage" data-testid="tenant-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="state.page = 1">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </label>
        <p class="text-xs text-slate-500 dark:text-slate-400">Shift+klik header = multi-sort</p>
        <button type="button" data-testid="tenant-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="resetSort"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th class="w-10 px-4 py-3"><input v-model="selectAll" type="checkbox" data-testid="tenant-select-all" aria-label="Pilih semua" class="h-4 w-4" /></th>
              <th class="px-4 py-3"><button type="button" data-testid="tenant-sort-nama" class="font-semibold hover:text-emerald-700" @click="cycleSort('nama', $event.shiftKey)">Nama <span data-testid="tenant-sort-nama-ind">{{ sortInd('nama') }}</span></button></th>
              <th class="px-4 py-3">Email</th>
              <th class="px-4 py-3"><button type="button" data-testid="tenant-sort-status" class="font-semibold hover:text-emerald-700" @click="cycleSort('status', $event.shiftKey)">Status <span data-testid="tenant-sort-status-ind">{{ sortInd('status') }}</span></button></th>
              <th class="px-4 py-3"><button type="button" data-testid="tenant-sort-created" class="font-semibold hover:text-emerald-700" @click="cycleSort('created_at', $event.shiftKey)">Dibuat <span data-testid="tenant-sort-created-ind">{{ sortInd('created_at') }}</span></button></th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody data-testid="tenant-rows">
            <tr v-if="pageRows.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ emptyText }}</td>
            </tr>
            <tr v-for="r in pageRows" :key="r.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td class="px-4 py-3"><input v-model="selected[r.id]" type="checkbox" data-testid="tenant-select" :data-id="r.id" :aria-label="'Pilih ' + r.nama" class="h-4 w-4" /></td>
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ r.nama }}</td>
              <td class="px-4 py-3 break-all font-mono text-xs text-slate-600 dark:text-slate-400">{{ r.email }}</td>
              <td class="px-4 py-3"><UiBadge :text="r.status === 'aktif' ? 'Aktif' : 'Nonaktif'" :tone="r.status === 'aktif' ? 'emerald' : 'slate'" /></td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(r.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <button type="button" data-testid="tenant-detail" :data-id="r.id" title="Detail" :aria-label="'Detail ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="goDetail(r.id)"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>
                  <button type="button" data-testid="tenant-edit" :data-id="r.id" title="Ubah" :aria-label="'Ubah ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openForm(r)"><i class="fa-solid fa-edit" aria-hidden="true"></i></button>
                  <button type="button" data-testid="tenant-delete" :data-id="r.id" title="Hapus" :aria-label="'Hapus ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300" @click="openDelete([r.id])"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination p="tenant" :page="state.page" :pages="pages" :from="from" :to="to" :total="filtered.length" @prev="state.page--" @next="state.page++" />
    </section>
  </div>

  <UiModal v-if="modalOpen" p="tenant" :title="editingId ? 'Ubah Tenant' : 'Tambah Tenant'" @close="modalOpen = false" @backdrop="modalOpen = false">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="tenant-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(formErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(formErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in formErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="tenant-form" novalidate @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label for="tenant-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama <span class="text-red-500">*</span></label>
            <input id="tenant-nama" v-model="form.nama" data-testid="tenant-nama" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.nama }" />
            <p data-testid="tenant-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.nama ? '' : 'hidden']">{{ formErrs.nama }}</p>
          </div>
          <div>
            <label for="tenant-email" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Email <span class="text-red-500">*</span></label>
            <input id="tenant-email" v-model="form.email" data-testid="tenant-email" type="email" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.email }" />
            <p data-testid="tenant-email-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.email ? '' : 'hidden']">{{ formErrs.email }}</p>
          </div>
          <div>
            <label for="tenant-password" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Kata sandi {{ editingId ? '(opsional)' : '' }} <span v-if="!editingId" class="text-red-500">*</span></label>
            <input id="tenant-password" v-model="form.password" data-testid="tenant-password" type="password" autocomplete="new-password" :placeholder="editingId ? 'Kosongkan bila tidak diubah' : ''" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.password }" />
            <p data-testid="tenant-password-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.password ? '' : 'hidden']">{{ formErrs.password }}</p>
          </div>
          <div>
            <label for="tenant-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
            <input id="tenant-deskripsi" v-model="form.deskripsi" data-testid="tenant-deskripsi" type="text" maxlength="500" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
            <p data-testid="tenant-deskripsi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.deskripsi ? '' : 'hidden']">{{ formErrs.deskripsi }}</p>
          </div>
          <div>
            <label for="tenant-status-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status <span class="text-red-500">*</span></label>
            <select id="tenant-status-input" v-model="form.status" data-testid="tenant-status-input" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <p data-testid="tenant-status-input-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.status ? '' : 'hidden']">{{ formErrs.status }}</p>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="tenant-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="modalOpen = false">Batal</button>
      <button type="button" data-testid="tenant-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitForm">Simpan</button>
    </div>
  </UiModal>

  <UiModal v-if="deleteOpen" p="tenant-delete" title="Hapus tenant?" max-w="max-w-md" @close="deleteOpen = false" @backdrop="deleteOpen = false">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <p data-testid="tenant-delete-text" class="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">{{ deleteText }}</p>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="tenant-delete-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="deleteOpen = false">Batal</button>
      <button type="button" data-testid="tenant-delete-confirm" class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="confirmDelete">Hapus</button>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'

definePageMeta({ layout: 'provider' })
useHead({ title: 'Tenant - UPGR' })

const { toast } = useToast()

interface Tenant {
  id: string
  nama: string
  email: string
  deskripsi: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
}

const rows = ref<Tenant[]>([])
const state = reactive({ q: '', status: '', page: 1, perPage: 10, sorts: [{ key: 'created_at', dir: 'desc' }] as Array<{ key: string, dir: 'asc' | 'desc' }> })
const filter = reactive({ q: '', status: '' })
const selected = reactive<Record<string, boolean>>({})
const selectAll = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deletingIds = ref<string[]>([])
const form = reactive({ nama: '', email: '', password: '', deskripsi: '', status: 'aktif' })
const formErrs = reactive<Record<string, string>>({})
const importFile = ref<HTMLInputElement | null>(null)

const emptyText = computed(() => {
  if (rows.value.length === 0 && !state.q && !state.status) return 'Belum ada tenant. Tambahkan tenant pertama.'
  return 'Tidak ada hasil. Ubah filter atau tambah tenant baru.'
})

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

async function load() {
  const res = await $fetch<{ data: Tenant[] }>('/api_web/provider/tenants')
  rows.value = res.data
}

function goDetail(id: string) {
  navigateTo(`/provider/tenant/${id}`)
}

const filtered = computed(() => {
  const s = state.q.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (state.status && r.status !== state.status) return false
    if (s && (r.nama + ' ' + r.email).toLowerCase().indexOf(s) < 0) return false
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

function validateLocal(isEdit: boolean) {
  const e: Record<string, string> = {}
  if (!form.nama.trim()) e.nama = 'Nama wajib diisi.'
  else if (form.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (!form.email.trim()) e.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email tidak valid.'
  else if (form.email.trim().length > 100) e.email = 'Email maksimal 100 karakter.'
  if (!isEdit || form.password) {
    if (!form.password) e.password = 'Kata sandi wajib diisi.'
    else if (form.password.length < 8) e.password = 'Kata sandi minimal 8 karakter.'
  }
  if (form.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  if (form.status !== 'aktif' && form.status !== 'nonaktif') e.status = 'Status tidak valid.'
  return e
}

function openForm(row: Tenant | null) {
  editingId.value = row ? row.id : null
  form.nama = row?.nama || ''
  form.email = row?.email || ''
  form.password = ''
  form.deskripsi = row?.deskripsi || ''
  form.status = row?.status || 'aktif'
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  modalOpen.value = true
}

async function submitForm() {
  const errs = validateLocal(!!editingId.value)
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  Object.assign(formErrs, errs)
  if (Object.keys(errs).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  try {
    const payload: Record<string, string> = { nama: form.nama.trim(), email: form.email.trim(), deskripsi: form.deskripsi.trim(), status: form.status }
    if (form.password) payload.password = form.password
    else if (!editingId.value) payload.password = form.password
    if (editingId.value) await $fetch(`/api_web/provider/tenants/${editingId.value}`, { method: 'PUT', body: payload })
    else await $fetch('/api_web/provider/tenants', { method: 'POST', body: payload })
    toast('Tenant tersimpan.')
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
  const names = deletingIds.value.map(id => rows.value.find(r => r.id === id)?.nama || id)
  return deletingIds.value.length === 1
    ? `Hapus tenant "${names[0]}"? Tindakan ini tidak dapat dibatalkan.`
    : `Hapus ${deletingIds.value.length} tenant? Tindakan ini tidak dapat dibatalkan.`
})

async function confirmDelete() {
  try {
    if (deletingIds.value.length === 1) {
      await $fetch(`/api_web/provider/tenants/${deletingIds.value[0]}`, { method: 'DELETE' })
      toast('Tenant terhapus.')
    } else {
      const res = await $fetch<{ data: { diproses: number, dilewati: number } }>('/api_web/provider/tenants/bulk-delete', { method: 'POST', body: { ids: deletingIds.value } })
      toast(res.data.dilewati ? `Terhapus ${res.data.diproses}, dilewati ${res.data.dilewati}.` : `Terhapus ${res.data.diproses} tenant.`)
    }
    clearSelected()
    deleteOpen.value = false
    await load()
  } catch (err: any) {
    toast('Gagal menghapus: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

async function bulkStatus(status: string) {
  try {
    const res = await $fetch<{ data: { diubah: number } }>('/api_web/provider/tenants/bulk-status', { method: 'POST', body: { ids: selectedIds.value, status } })
    toast(`${res.data.diubah} tenant diubah menjadi ${status}.`)
    clearSelected()
    await load()
  } catch (err: any) {
    toast('Gagal mengubah status: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

function stamp() {
  const d = new Date()
  const p = (n: number) => (n < 10 ? '0' : '') + n
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

async function exportXlsx() {
  const data = sorted.value.map(r => ({ Nama: r.nama, Email: r.email, Deskripsi: r.deskripsi, Status: r.status, Dibuat: fmtDate(r.created_at) }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Nama: '', Email: '', Deskripsi: '', Status: '', Dibuat: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Tenant')
  XLSX.writeFile(wb, `tenant-${stamp()}.xlsx`)
  toast(`Diekspor ${data.length} tenant ke Excel.`)
}

function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Nama', 'Email', 'Password', 'Deskripsi', 'Status'],
    ['PT Contoh', 'admin@contoh.id', 'minimal8karakter', 'Tenant contoh', 'aktif']
  ]), 'Tenant')
  XLSX.writeFile(wb, 'template-tenant.xlsx')
  toast('Template impor tenant diunduh.')
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
      const iEmail = col('email')
      const iPass = col('password', 'kata sandi')
      const iDesk = col('deskripsi', 'description')
      const iStatus = col('status')
      if (iNama < 0 || iEmail < 0) { toast('Header tidak dikenali. Butuh kolom Nama dan Email.', 'error'); return }
      const rowsIn = aoa.slice(1).map(line => ({
        nama: String(line[iNama] ?? ''),
        email: String(line[iEmail] ?? ''),
        password: String(iPass >= 0 ? line[iPass] ?? '' : ''),
        deskripsi: String(iDesk >= 0 ? line[iDesk] ?? '' : ''),
        status: String(iStatus >= 0 && line[iStatus] != null ? line[iStatus] : 'aktif').trim().toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif'
      }))
      const res = await $fetch<{ data: { ditambah: number, dilewati: number } }>('/api_web/provider/tenants/bulk-import', { method: 'POST', body: { rows: rowsIn } })
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
