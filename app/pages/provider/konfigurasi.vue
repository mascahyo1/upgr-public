<template>
  <div data-testid="page-konfig">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/provider/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Provider</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Konfigurasi</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Konfigurasi</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola pengaturan global aplikasi. Nilai bertipe rahasia disensor di tabel.</p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button type="button" data-testid="konfig-template-btn" title="Unduh contoh template impor" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Template</button>
      <button type="button" data-testid="konfig-import-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="triggerImport"><i class="fa-solid fa-file-import mr-1.5" aria-hidden="true"></i>Impor (.xlsx/.csv)</button>
      <input ref="importFile" type="file" data-testid="konfig-import-file" accept=".xlsx,.xls,.csv" class="hidden" @change="onImportFile" />
      <button type="button" data-testid="konfig-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportXlsx"><i class="fa-solid fa-file-export mr-1.5" aria-hidden="true"></i>Ekspor (.xlsx)</button>
      <button type="button" data-testid="konfig-add" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openForm(null)"><i class="fa-solid fa-plus mr-1.5" aria-hidden="true"></i>Tambah</button>
    </div>

    <div class="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <form data-testid="konfig-filter-form" @submit.prevent="applyFilter">
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label for="konfig-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
            <input id="konfig-q" v-model="filter.q" data-testid="konfig-q" type="search" placeholder="Kode, nama, atau deskripsi" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="konfig-type" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tipe</label>
            <select id="konfig-type" v-model="filter.type" data-testid="konfig-type" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="">Semua</option>
              <option value="kredensial">Rahasia</option>
              <option value="text">Teks</option>
              <option value="number">Angka</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button type="button" data-testid="konfig-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
            <button type="submit" data-testid="konfig-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="bulkCount" data-testid="konfig-bulkbar" class="mt-4 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span><strong data-testid="konfig-selected-count">{{ bulkCount }}</strong> dipilih</span>
      <button type="button" data-testid="konfig-bulk-delete" class="rounded-md border border-red-400 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900" @click="openDelete(selectedIds)">Hapus</button>
      <button type="button" data-testid="konfig-bulk-clear" class="ml-auto underline" @click="clearSelected">Batalkan pilihan</button>
    </div>

    <div class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <label class="text-sm text-slate-500 dark:text-slate-400">Baris
          <select v-model.number="state.perPage" data-testid="konfig-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </label>
        <button type="button" data-testid="konfig-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="resetSort"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr class="border-b border-slate-200 dark:border-slate-800">
              <th class="w-10 px-4 py-3"><input v-model="selectAll" type="checkbox" data-testid="konfig-select-all" aria-label="Pilih semua" class="h-4 w-4" /></th>
              <th class="px-4 py-3"><button type="button" data-testid="konfig-sort-kode" class="font-semibold hover:text-emerald-700" @click="cycleSort('kode', $event.shiftKey)">Kode <span data-testid="konfig-sort-kode-ind">{{ sortInd('kode') }}</span></button></th>
              <th class="px-4 py-3"><button type="button" data-testid="konfig-sort-nama" class="font-semibold hover:text-emerald-700" @click="cycleSort('nama', $event.shiftKey)">Nama <span data-testid="konfig-sort-nama-ind">{{ sortInd('nama') }}</span></button></th>
              <th class="px-4 py-3"><button type="button" data-testid="konfig-sort-type" class="font-semibold hover:text-emerald-700" @click="cycleSort('type', $event.shiftKey)">Tipe <span data-testid="konfig-sort-type-ind">{{ sortInd('type') }}</span></button></th>
              <th class="px-4 py-3">Nilai</th>
              <th class="px-4 py-3"><button type="button" data-testid="konfig-sort-created" class="font-semibold hover:text-emerald-700" @click="cycleSort('created_at', $event.shiftKey)">Dibuat <span data-testid="konfig-sort-created-ind">{{ sortInd('created_at') }}</span></button></th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody data-testid="konfig-rows">
            <tr v-if="pageRows.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">{{ emptyText }}</td>
            </tr>
            <tr v-for="r in pageRows" :key="r.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td class="px-4 py-3"><input v-model="selected[r.id]" type="checkbox" data-testid="konfig-select" :data-id="r.id" :aria-label="'Pilih ' + r.kode" class="h-4 w-4" /></td>
              <td class="px-4 py-3 font-mono text-xs">{{ r.kode }}</td>
              <td class="px-4 py-3 font-medium">{{ r.nama }}</td>
              <td class="px-4 py-3"><UiBadge :text="typeLabel(r.type)" :tone="typeTone(r.type)" /></td>
              <td class="px-4 py-3 font-mono text-xs">{{ displayValue(r) }}</td>
              <td class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{{ fmtDate(r.created_at) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right">
                <button type="button" data-testid="konfig-detail" :data-id="r.id" title="Detail" :aria-label="'Detail ' + r.kode" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openDetail(r)"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>
                <button type="button" data-testid="konfig-edit" :data-id="r.id" title="Ubah" :aria-label="'Ubah ' + r.kode" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openForm(r)"><i class="fa-solid fa-edit" aria-hidden="true"></i></button>
                <button type="button" data-testid="konfig-delete" :data-id="r.id" title="Hapus" :aria-label="'Hapus ' + r.kode" class="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-300" @click="openDelete([r.id])"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
        <p data-testid="konfig-pageinfo">{{ from }} - {{ to }} / {{ filtered.length }}</p>
        <div class="flex items-center gap-2">
          <button type="button" data-testid="konfig-prev" title="Halaman sebelumnya" aria-label="Halaman sebelumnya" :disabled="state.page <= 1" class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" @click="state.page = Math.max(1, state.page - 1)"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
          <span data-testid="konfig-page" class="px-2">{{ state.page }} / {{ pages }}</span>
          <button type="button" data-testid="konfig-next" title="Halaman berikutnya" aria-label="Halaman berikutnya" :disabled="state.page >= pages" class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" @click="state.page = Math.min(pages, state.page + 1)"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
        </div>
      </div>
    </div>
  </div>

  <UiModal v-if="modalOpen" p="konfig" :title="editingId ? 'Ubah Konfigurasi' : 'Tambah Konfigurasi'" max-w="max-w-lg" @close="modalOpen = false" @backdrop="modalOpen = false">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="konfig-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(formErrs).length ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(formErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in formErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="konfig-form" novalidate @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label for="konfig-kode" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Kode <span class="text-red-500">*</span></label>
            <input id="konfig-kode" v-model="form.kode" data-testid="konfig-kode" type="text" maxlength="50" placeholder="huruf-kecil-angka-dash" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.kode }" />
            <p data-testid="konfig-kode-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.kode ? '' : 'hidden']">{{ formErrs.kode }}</p>
          </div>
          <div>
            <label for="konfig-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama <span class="text-red-500">*</span></label>
            <input id="konfig-nama" v-model="form.nama" data-testid="konfig-nama" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.nama }" />
            <p data-testid="konfig-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.nama ? '' : 'hidden']">{{ formErrs.nama }}</p>
          </div>
          <div>
            <label for="konfig-type-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tipe <span class="text-red-500">*</span></label>
            <select id="konfig-type-input" v-model="form.type" data-testid="konfig-type-input" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="kredensial">Rahasia</option>
              <option value="text">Teks</option>
              <option value="number">Angka</option>
              <option value="boolean">Boolean</option>
            </select>
            <p data-testid="konfig-type-input-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.type ? '' : 'hidden']">{{ formErrs.type }}</p>
          </div>
          <div>
            <label for="konfig-value-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nilai <span class="text-red-500">*</span></label>
            <div v-if="form.type === 'kredensial'" data-testid="konfig-value-wrap-secret" class="flex gap-2">
              <input id="konfig-value-input" v-model="form.value" data-testid="konfig-value-secret" :type="showSecret ? 'text' : 'password'" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.value }" />
              <button type="button" data-testid="konfig-show" :aria-label="showSecret ? 'Sembunyikan nilai' : 'Tampilkan nilai'" class="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="showSecret = !showSecret"><i :class="showSecret ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" aria-hidden="true"></i></button>
            </div>
            <div v-else-if="form.type === 'text'" data-testid="konfig-value-wrap-text">
              <input id="konfig-value-input" v-model="form.value" data-testid="konfig-value-text" type="text" maxlength="500" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.value }" />
            </div>
            <div v-else-if="form.type === 'number'" data-testid="konfig-value-wrap-number">
              <input id="konfig-value-input" v-model="form.value" data-testid="konfig-value-number" type="text" inputmode="decimal" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.value }" />
            </div>
            <div v-else data-testid="konfig-value-wrap-bool">
              <select id="konfig-value-input" v-model="form.value" data-testid="konfig-value-bool" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
            <p data-testid="konfig-value-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.value ? '' : 'hidden']">{{ formErrs.value }}</p>
          </div>
          <div>
            <label for="konfig-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
            <textarea id="konfig-deskripsi" v-model="form.deskripsi" data-testid="konfig-deskripsi" rows="2" maxlength="500" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950"></textarea>
            <p data-testid="konfig-deskripsi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.deskripsi ? '' : 'hidden']">{{ formErrs.deskripsi }}</p>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="konfig-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="modalOpen = false">Batal</button>
      <button type="button" data-testid="konfig-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitForm">Simpan</button>
    </div>
  </UiModal>

  <UiModal v-if="deleteOpen" p="konfig-delete" title="Hapus konfigurasi?" max-w="max-w-md" @close="deleteOpen = false" @backdrop="deleteOpen = false">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <p data-testid="konfig-delete-text" class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ deleteText }}</p>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="konfig-delete-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="deleteOpen = false">Batal</button>
      <button type="button" data-testid="konfig-delete-confirm" class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="confirmDelete">Hapus</button>
    </div>
  </UiModal>

  <UiModal v-if="detailOpen" p="konfig-detail" title="Detail Konfigurasi" max-w="max-w-lg" @close="detailOpen = false" @backdrop="detailOpen = false">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <dl data-testid="konfig-detail-body" class="space-y-2 text-sm">
        <div v-if="detailRow" class="space-y-2">
          <div class="flex gap-2"><dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Kode</dt><dd class="font-mono text-xs">{{ detailRow.kode }}</dd></div>
          <div class="flex gap-2"><dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Nama</dt><dd class="font-medium">{{ detailRow.nama }}</dd></div>
          <div class="flex gap-2"><dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Tipe</dt><dd>{{ typeLabel(detailRow.type) }}</dd></div>
          <div class="flex gap-2"><dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Nilai</dt><dd class="font-mono text-xs">{{ displayValue(detailRow) }}</dd></div>
          <div class="flex gap-2"><dt class="w-24 shrink-0 text-slate-500 dark:text-slate-400">Deskripsi</dt><dd>{{ detailRow.deskripsi || '-' }}</dd></div>
        </div>
      </dl>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="konfig-detail-close" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="detailOpen = false">Tutup</button>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'

definePageMeta({ layout: 'provider' })
useHead({ title: 'Konfigurasi - UPGR' })

const { toast } = useToast()

interface Konfig {
  id: string
  kode: string
  nama: string
  type: string
  value: string
  deskripsi: string
  created_at: string
  updated_at: string
}

const TYPE_LABELS: Record<string, string> = { kredensial: 'Rahasia', text: 'Teks', number: 'Angka', boolean: 'Boolean' }

const rows = ref<Konfig[]>([])
const state = reactive({ q: '', type: '', page: 1, perPage: 10, sorts: [{ key: 'created_at', dir: 'desc' }] as Array<{ key: string, dir: 'asc' | 'desc' }> })
const filter = reactive({ q: '', type: '' })
const selected = reactive<Record<string, boolean>>({})
const selectAll = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deletingIds = ref<string[]>([])
const detailOpen = ref(false)
const detailRow = ref<Konfig | null>(null)
const showSecret = ref(false)
const form = reactive({ kode: '', nama: '', type: 'kredensial', value: '', deskripsi: '' })
const formErrs = reactive<Record<string, string>>({})
const importFile = ref<HTMLInputElement | null>(null)

const emptyText = computed(() => {
  if (rows.value.length === 0 && !state.q && !state.type) return 'Belum ada konfigurasi. Tambahkan konfigurasi pertama.'
  return 'Tidak ada hasil. Ubah filter atau tambah konfigurasi baru.'
})

function typeLabel(t: string) { return TYPE_LABELS[t] || t }
function typeTone(t: string): 'red' | 'amber' | 'slate' { return t === 'kredensial' ? 'red' : t === 'boolean' ? 'amber' : 'slate' }
function displayValue(r: Konfig) { return r.type === 'kredensial' ? '••••••••' : r.value }

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

async function load() {
  const res = await $fetch<{ data: Konfig[] }>('/api_web/provider/konfigurasi')
  rows.value = res.data
}

const filtered = computed(() => {
  const s = state.q.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (state.type && r.type !== state.type) return false
    if (s && (r.kode + ' ' + r.nama + ' ' + (r.deskripsi || '')).toLowerCase().indexOf(s) < 0) return false
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
  state.type = filter.type
  state.page = 1
  clearSelected()
}

function resetFilter() {
  filter.q = ''
  filter.type = ''
  state.q = ''
  state.type = ''
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
  if (!form.kode.trim()) e.kode = 'Kode wajib diisi.'
  else if (!/^[a-z0-9][a-z0-9_-]{1,49}$/.test(form.kode.trim().toLowerCase())) e.kode = 'Kode 2-50 karakter: huruf kecil, angka, dash, underscore.'
  if (!form.nama.trim()) e.nama = 'Nama wajib diisi.'
  else if (form.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (['kredensial', 'text', 'number', 'boolean'].indexOf(form.type) < 0) e.type = 'Tipe tidak valid.'
  if (form.type === 'boolean') {
    if (form.value !== 'true' && form.value !== 'false') e.value = 'Nilai boolean harus true atau false.'
  } else if (!form.value) {
    e.value = 'Nilai wajib diisi.'
  } else if (form.type === 'number' && !/^-?\d+(\.\d+)?$/.test(form.value.trim())) {
    e.value = 'Nilai harus berupa angka.'
  } else if (form.value.length > 500) {
    e.value = 'Nilai maksimal 500 karakter.'
  }
  if (form.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  return e
}

function openForm(row: Konfig | null) {
  editingId.value = row ? row.id : null
  form.kode = row?.kode || ''
  form.nama = row?.nama || ''
  form.type = row?.type || 'kredensial'
  form.value = row ? row.value : (form.type === 'boolean' ? 'false' : '')
  if (!row && form.type !== 'boolean') form.value = ''
  form.deskripsi = row?.deskripsi || ''
  showSecret.value = false
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  modalOpen.value = true
}

function openDetail(row: Konfig) {
  detailRow.value = row
  detailOpen.value = true
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
    const payload = { kode: form.kode.trim(), nama: form.nama.trim(), type: form.type, value: form.type === 'boolean' ? form.value : form.value.trim(), deskripsi: form.deskripsi.trim() }
    if (editingId.value) await $fetch(`/api_web/provider/konfigurasi/${editingId.value}`, { method: 'PUT', body: payload })
    else await $fetch('/api_web/provider/konfigurasi', { method: 'POST', body: payload })
    toast('Konfigurasi tersimpan.')
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
  const names = deletingIds.value.map(id => rows.value.find(r => r.id === id)?.kode || id)
  return deletingIds.value.length === 1
    ? `Hapus konfigurasi "${names[0]}"? Tindakan ini tidak dapat dibatalkan.`
    : `Hapus ${deletingIds.value.length} konfigurasi? Tindakan ini tidak dapat dibatalkan.`
})

async function confirmDelete() {
  try {
    if (deletingIds.value.length === 1) {
      await $fetch(`/api_web/provider/konfigurasi/${deletingIds.value[0]}`, { method: 'DELETE' })
      toast('Konfigurasi terhapus.')
    } else {
      const res = await $fetch<{ data: { diproses: number, dilewati: number } }>('/api_web/provider/konfigurasi/bulk-delete', { method: 'POST', body: { ids: deletingIds.value } })
      toast(res.data.dilewati ? `Terhapus ${res.data.diproses}, dilewati ${res.data.dilewati}.` : `Terhapus ${res.data.diproses} konfigurasi.`)
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
  const data = sorted.value.map(r => ({ Kode: r.kode, Nama: r.nama, Tipe: r.type, Nilai: r.value, Deskripsi: r.deskripsi }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Kode: '', Nama: '', Tipe: '', Nilai: '', Deskripsi: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Konfigurasi')
  XLSX.writeFile(wb, `konfigurasi-${stamp()}.xlsx`)
  toast(`Diekspor ${data.length} konfigurasi ke Excel.`)
}

function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Kode', 'Nama', 'Tipe', 'Nilai', 'Deskripsi'],
    ['midtrans-server-key', 'Midtrans Server Key', 'kredensial', 'SB-Mid-xxx', 'Kunci server Midtrans'],
    ['batas-harian', 'Batas Harian', 'number', '100', 'Batas transaksi harian']
  ]), 'Konfigurasi')
  XLSX.writeFile(wb, 'template-konfigurasi.xlsx')
  toast('Template impor konfigurasi diunduh.')
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
      const iKode = col('kode', 'code')
      const iNama = col('nama', 'name')
      const iType = col('tipe', 'type')
      const iValue = col('nilai', 'value')
      const iDesk = col('deskripsi', 'description')
      if (iKode < 0 || iNama < 0) { toast('Header tidak dikenali. Butuh kolom Kode dan Nama.', 'error'); return }
      const rowsIn = aoa.slice(1).map(line => ({
        kode: String(line[iKode] ?? ''),
        nama: String(line[iNama] ?? ''),
        type: String(iType >= 0 ? line[iType] ?? 'kredensial' : 'kredensial').trim().toLowerCase(),
        value: String(iValue >= 0 ? line[iValue] ?? '' : ''),
        deskripsi: String(iDesk >= 0 ? line[iDesk] ?? '' : '')
      }))
      const res = await $fetch<{ data: { ditambah: number, dilewati: number } }>('/api_web/provider/konfigurasi/bulk-import', { method: 'POST', body: { rows: rowsIn } })
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
