<template>
  <div data-testid="page-cred-list">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700">Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Kredensial Gateway</li>
      </ol>
    </nav>

    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Kredensial Payment Gateway</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Kunci gateway milik tenant. Secret dan token disensor di layar, enkripsi menyusul.</p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button type="button" data-testid="cred-template-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="downloadTemplate">
        <i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Template
      </button>
      <button type="button" data-testid="cred-import-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="triggerImport">
        <i class="fa-solid fa-file-import mr-1.5" aria-hidden="true"></i>Impor
      </button>
      <input ref="importFile" type="file" data-testid="cred-import-file" accept=".xlsx,.xls,.csv" class="hidden" @change="onImportFile" />
      <button type="button" data-testid="cred-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportExcel">
        <i class="fa-solid fa-file-export mr-1.5" aria-hidden="true"></i>Ekspor Excel
      </button>
      <button type="button" data-testid="cred-add" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openForm('tambah')">
        <i class="fa-solid fa-plus mr-1.5" aria-hidden="true"></i>Tambah
      </button>
    </div>

    <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter kredensial">
      <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
        <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
      </p>
      <form data-testid="cred-filter-form" @submit.prevent="applyFilter">
        <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label for="cred-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
            <input id="cred-q" v-model="filter.q" data-testid="cred-q" type="search" placeholder="Nama, provider, atau merchant ID" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="cred-provider" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Provider</label>
            <select id="cred-provider" v-model="filter.provider" data-testid="cred-provider" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="">Semua</option>
              <option value="midtrans">Midtrans</option>
              <option value="doku">DOKU</option>
              <option value="xendit">Xendit</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div>
            <label for="cred-active" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Mode</label>
            <select id="cred-active" v-model="filter.mode" data-testid="cred-active" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="">Semua</option>
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <div>
            <label for="cred-status" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status</label>
            <select id="cred-status" v-model="filter.status" data-testid="cred-status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button type="button" data-testid="cred-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetFilter">
            <i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset
          </button>
          <button type="submit" data-testid="cred-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
            <i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter
          </button>
        </div>
      </form>
    </section>

    <div v-if="bulkCount > 0" data-testid="cred-bulkbar" class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-5 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
      <span data-testid="cred-selected-count" class="font-semibold text-amber-800 dark:text-amber-200">{{ bulkCount }} dipilih</span>
      <button type="button" data-testid="cred-bulk-delete" class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700" @click="openDelete(selectedIds)">Hapus terpilih</button>
      <button type="button" data-testid="cred-bulk-clear" class="rounded-md border border-amber-400 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900" @click="clearSelected">Batal</button>
    </div>

    <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Daftar kredensial">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
          <select v-model.number="state.perPage" data-testid="cred-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="state.page = 1">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </label>
        <span class="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">Shift+klik header = multi-sort</span>
        <button type="button" data-testid="cred-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="resetSort">
          <i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th class="w-10 px-4 py-3"><input v-model="selectAll" type="checkbox" data-testid="cred-select-all" aria-label="Pilih semua" class="h-4 w-4" /></th>
              <th class="px-4 py-3"><button type="button" data-testid="cred-sort-nama" class="font-semibold hover:text-emerald-700" @click="cycleSort('nama', $event.shiftKey)">Nama <span data-testid="cred-sort-nama-ind">{{ sortInd('nama') }}</span></button></th>
              <th class="px-4 py-3"><button type="button" data-testid="cred-sort-provider" class="font-semibold hover:text-emerald-700" @click="cycleSort('provider', $event.shiftKey)">Provider <span data-testid="cred-sort-provider-ind">{{ sortInd('provider') }}</span></button></th>
              <th class="px-4 py-3"><button type="button" data-testid="cred-sort-mode" class="font-semibold hover:text-emerald-700" @click="cycleSort('is_production', $event.shiftKey)">Mode <span data-testid="cred-sort-mode-ind">{{ sortInd('is_production') }}</span></button></th>
              <th class="px-4 py-3"><button type="button" data-testid="cred-sort-status" class="font-semibold hover:text-emerald-700" @click="cycleSort('status', $event.shiftKey)">Status <span data-testid="cred-sort-status-ind">{{ sortInd('status') }}</span></button></th>
              <th class="px-4 py-3">Merchant ID</th>
              <th class="px-4 py-3">Key</th>
              <th class="px-4 py-3"><button type="button" data-testid="cred-sort-created" class="font-semibold hover:text-emerald-700" @click="cycleSort('created_at', $event.shiftKey)">Dibuat <span data-testid="cred-sort-created-ind">{{ sortInd('created_at') }}</span></button></th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody data-testid="cred-rows">
            <tr v-if="pageRows.length === 0">
              <td colspan="9" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                <i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ emptyText }}
              </td>
            </tr>
            <tr v-for="r in pageRows" :key="r.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
              <td class="px-4 py-3"><input v-model="selected[r.id]" type="checkbox" data-testid="cred-select" :data-id="r.id" :aria-label="'Pilih ' + r.nama" class="h-4 w-4" /></td>
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ r.nama }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ r.provider }}</td>
              <td class="px-4 py-3"><UiBadge :text="r.is_production ? 'Production' : 'Sandbox'" :tone="r.is_production ? 'emerald' : 'slate'" /></td>
              <td class="px-4 py-3"><UiBadge :text="r.status === 'nonaktif' ? 'Nonaktif' : 'Aktif'" :tone="r.status === 'nonaktif' ? 'red' : 'emerald'" /></td>
              <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ r.merchant_id || '-' }}</td>
              <td class="px-4 py-3 break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ r.key }}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(r.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <NuxtLink :to="`/tenant/payment-gateway-credential/${r.id}`" data-testid="cred-detail-link" title="Halaman selengkapnya" :aria-label="'Halaman ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></NuxtLink>
                  <button type="button" data-testid="cred-detail" :data-id="r.id" title="Detail" :aria-label="'Detail ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openDetail(r)"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>
                  <button type="button" data-testid="cred-edit" :data-id="r.id" title="Ubah" :aria-label="'Ubah ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openForm('edit', r)"><i class="fa-solid fa-edit" aria-hidden="true"></i></button>
                  <button type="button" data-testid="cred-delete" :data-id="r.id" title="Hapus" :aria-label="'Hapus ' + r.nama" class="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300" @click="openDelete([r.id])"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination p="cred" :page="state.page" :pages="pages" :from="from" :to="to" :total="filtered.length" @prev="state.page--" @next="state.page++" />
    </section>
  </div>

  <UiModal v-if="modalOpen" p="cred" :title="editingId ? 'Ubah Kredensial' : 'Tambah Kredensial'" @close="closeModal" @backdrop="closeModal">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="cred-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(formErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(formErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in formErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="cred-form" novalidate @submit.prevent="submitForm">
        <div class="space-y-4">
          <div>
            <label for="cred-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama <span class="text-red-500">*</span></label>
            <input id="cred-nama" v-model="form.nama" data-testid="cred-nama" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.nama }" />
            <p data-testid="cred-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.nama ? '' : 'hidden']">{{ formErrs.nama }}</p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="cred-provider-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Provider <span class="text-red-500">*</span></label>
              <select id="cred-provider-input" v-model="form.provider" data-testid="cred-provider-input" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.provider }">
                <option value="" disabled>Pilih provider</option>
                <option value="midtrans">Midtrans</option>
                <option value="doku">DOKU</option>
                <option value="xendit">Xendit</option>
                <option value="stripe">Stripe</option>
              </select>
              <p data-testid="cred-provider-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.provider ? '' : 'hidden']">{{ formErrs.provider }}</p>
            </div>
            <div>
              <label for="cred-mode-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Mode <span class="text-red-500">*</span></label>
              <select id="cred-mode-input" v-model="form.mode" data-testid="cred-mode-input" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.mode }">
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
              <p data-testid="cred-mode-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.mode ? '' : 'hidden']">{{ formErrs.mode }}</p>
            </div>
          </div>
          <div>
            <label for="cred-status-input" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status <span class="text-red-500">*</span></label>
            <select id="cred-status-input" v-model="form.status" data-testid="cred-status-input" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.status }">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <p data-testid="cred-status-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.status ? '' : 'hidden']">{{ formErrs.status }}</p>
          </div>
          <div>
            <label for="cred-merchant" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Merchant ID</label>
            <input id="cred-merchant" v-model="form.merchant" data-testid="cred-merchant" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.merchant }" />
            <p data-testid="cred-merchant-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.merchant ? '' : 'hidden']">{{ formErrs.merchant }}</p>
          </div>
          <div>
            <label for="cred-key" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Key <span class="text-red-500">*</span></label>
            <input id="cred-key" v-model="form.key" data-testid="cred-key" type="text" maxlength="200" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.key }" />
            <p data-testid="cred-key-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.key ? '' : 'hidden']">{{ formErrs.key }}</p>
          </div>
          <div>
            <label for="cred-secret" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Secret <span class="text-red-500">*</span></label>
            <input id="cred-secret" v-model="form.secret" data-testid="cred-secret" type="password" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.secret }" />
            <p data-testid="cred-secret-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.secret ? '' : 'hidden']">{{ formErrs.secret }}</p>
          </div>
          <div>
            <label for="cred-token" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Webhook verify token</label>
            <input id="cred-token" v-model="form.token" data-testid="cred-token" type="text" maxlength="200" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.token }" />
            <p data-testid="cred-token-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.token ? '' : 'hidden']">{{ formErrs.token }}</p>
          </div>
          <div>
            <label for="cred-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
            <textarea id="cred-deskripsi" v-model="form.deskripsi" data-testid="cred-deskripsi" rows="2" maxlength="500" placeholder="opsional, mis. Akun finance untuk QRIS kantin" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.deskripsi }"></textarea>
            <p data-testid="cred-deskripsi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.deskripsi ? '' : 'hidden']">{{ formErrs.deskripsi }}</p>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="cred-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="closeModal">Batal</button>
      <button type="button" data-testid="cred-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitForm">Simpan</button>
    </div>
  </UiModal>

  <UiModal v-if="deleteOpen" p="cred-delete" title="Hapus kredensial?" max-w="max-w-md" @close="deleteOpen = false" @backdrop="deleteOpen = false">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <p data-testid="cred-delete-text" class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ deleteText }}</p>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="cred-delete-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="deleteOpen = false">Batal</button>
      <button type="button" data-testid="cred-delete-confirm" class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="confirmDelete">Hapus</button>
    </div>
  </UiModal>

  <UiModal v-if="detailRow" p="cred-detail" title="Detail Kredensial" max-w="max-w-md" @close="detailRow = null" @backdrop="detailRow = null">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <dl data-testid="cred-detail-body" class="space-y-2 text-sm">
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Nama</dt><dd class="font-medium text-slate-900 dark:text-white">{{ detailRow.nama }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Provider</dt><dd class="text-slate-700 dark:text-slate-300">{{ detailRow.provider }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Mode</dt><dd><UiBadge :text="detailRow.is_production ? 'Production' : 'Sandbox'" :tone="detailRow.is_production ? 'emerald' : 'slate'" /></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Status</dt><dd><UiBadge :text="detailRow.status === 'nonaktif' ? 'Nonaktif' : 'Aktif'" :tone="detailRow.status === 'nonaktif' ? 'red' : 'emerald'" /></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Merchant ID</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailRow.merchant_id || '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Key</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ detailRow.key }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Secret</dt><dd class="font-mono text-xs tracking-widest">•••••••• <span class="text-slate-400">(disensor)</span></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Verify token</dt><dd class="font-mono text-xs tracking-widest">{{ detailRow.webhook_verify_token ? '•••••••• (disensor)' : '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Deskripsi</dt><dd class="text-slate-700 dark:text-slate-300">{{ detailRow.deskripsi || '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Dibuat</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(detailRow.created_at) }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Diubah</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(detailRow.updated_at) }}</dd></div>
      </dl>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="cred-detail-close" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="detailRow = null">Tutup</button>
      <NuxtLink :to="`/tenant/payment-gateway-credential/${detailRow.id}`" data-testid="cred-detail-more" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">Halaman selengkapnya</NuxtLink>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import * as XLSX from 'xlsx'

definePageMeta({ layout: 'admin' })

interface Cred {
  id: string
  nama: string
  provider: string
  is_production: boolean
  merchant_id: string
  key: string
  secret: string
  webhook_verify_token: string
  deskripsi: string
  status: string
  created_at: string
  updated_at: string
}

const { toast } = useToast()
const rows = ref<Cred[]>([])
const state = reactive({ q: '', provider: '', mode: '', status: '', page: 1, perPage: 10, sorts: [] as Array<{ key: string, dir: 'asc' | 'desc' }> })
const filter = reactive({ q: '', provider: '', mode: '', status: '' })
const selected = reactive<Record<string, boolean>>({})
const selectAll = ref(false)
const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deletingIds = ref<string[]>([])
const detailRow = ref<Cred | null>(null)
const form = reactive({ nama: '', provider: '', mode: 'sandbox', status: 'aktif', merchant: '', key: '', secret: '', token: '', deskripsi: '' })
const formErrs = reactive<Record<string, string>>({})
const importFile = ref<HTMLInputElement | null>(null)

const emptyText = computed(() => {
  if (rows.value.length === 0) return 'Belum ada kredensial. Klik Tambah untuk membuat.'
  return 'Tidak ada hasil. Ubah filter.'
})

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

async function load() {
  const res = await $fetch<{ data: Cred[] }>('/api_web/credentials')
  rows.value = res.data
}

function filtered() {
  const q = state.q.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (state.provider && r.provider !== state.provider) return false
    if (state.mode === 'production' && !r.is_production) return false
    if (state.mode === 'sandbox' && r.is_production) return false
    if (state.status === 'aktif' && r.status === 'nonaktif') return false
    if (state.status === 'nonaktif' && r.status !== 'nonaktif') return false
    if (q && ((r.nama || '') + ' ' + r.provider + ' ' + (r.merchant_id || '')).toLowerCase().indexOf(q) < 0) return false
    return true
  })
}

function sortRows(list: Cred[]) {
  if (!state.sorts.length) return list.slice().sort((a, b) => a.created_at < b.created_at ? 1 : -1)
  return list.slice().sort((a, b) => {
    for (const s of state.sorts) {
      const av = String((a as any)[s.key] ?? '')
      const bv = String((b as any)[s.key] ?? '')
      if (av < bv) return s.dir === 'asc' ? -1 : 1
      if (av > bv) return s.dir === 'asc' ? 1 : -1
    }
    return 0
  })
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
    if (cur) state.sorts[idx] = { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' }
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
  state.sorts = []
  state.page = 1
}

const pages = computed(() => Math.max(1, Math.ceil(filtered().length / state.perPage)))
const from = computed(() => filtered().length === 0 ? 0 : (state.page - 1) * state.perPage + 1)
const to = computed(() => Math.min(state.page * state.perPage, filtered().length))
const pageRows = computed(() => {
  const list = sortRows(filtered())
  if (state.page > pages.value) state.page = pages.value
  return list.slice((state.page - 1) * state.perPage, state.page * state.perPage)
})

const selectedIds = computed(() => Object.keys(selected).filter(id => selected[id]))
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
  state.provider = filter.provider
  state.mode = filter.mode
  state.status = filter.status
  state.page = 1
}

function resetFilter() {
  filter.q = ''
  filter.provider = ''
  filter.mode = ''
  filter.status = ''
  state.q = ''
  state.provider = ''
  state.mode = ''
  state.status = ''
  state.page = 1
}

function validateLocal() {
  const e: Record<string, string> = {}
  const nama = form.nama.trim()
  const provider = form.provider.trim().toLowerCase()
  if (!nama) e.nama = 'Nama wajib diisi.'
  else if (nama.length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (!provider) e.provider = 'Provider wajib diisi.'
  else if (!/^[a-z0-9][a-z0-9_-]{1,29}$/.test(provider)) e.provider = 'Provider 2-30 karakter: huruf kecil, angka, dash, underscore.'
  if (form.mode !== 'sandbox' && form.mode !== 'production') e.mode = 'Mode tidak valid.'
  if (form.status !== 'aktif' && form.status !== 'nonaktif') e.status = 'Status tidak valid.'
  if (form.merchant.trim().length > 100) e.merchant = 'Merchant ID maksimal 100 karakter.'
  if (!form.key.trim()) e.key = 'Key wajib diisi.'
  else if (form.key.trim().length < 4) e.key = 'Key minimal 4 karakter.'
  else if (form.key.trim().length > 200) e.key = 'Key maksimal 200 karakter.'
  if (!form.secret) e.secret = 'Secret wajib diisi.'
  else if (form.secret.length < 4) e.secret = 'Secret minimal 4 karakter.'
  else if (form.secret.length > 200) e.secret = 'Secret maksimal 200 karakter.'
  if (form.token.trim().length > 200) e.token = 'Token maksimal 200 karakter.'
  if (form.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  return e
}

function openForm(mode: 'tambah' | 'edit', row?: Cred) {
  editingId.value = mode === 'edit' && row ? row.id : null
  form.nama = row?.nama || ''
  form.provider = row?.provider || ''
  form.mode = row ? (row.is_production ? 'production' : 'sandbox') : 'sandbox'
  form.status = row?.status === 'nonaktif' ? 'nonaktif' : 'aktif'
  form.merchant = row?.merchant_id || ''
  form.key = row?.key || ''
  form.secret = row?.secret || ''
  form.token = row?.webhook_verify_token || ''
  form.deskripsi = row?.deskripsi || ''
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
}

async function submitForm() {
  const errs = validateLocal()
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  Object.assign(formErrs, errs)
  if (Object.keys(errs).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  const payload = {
    nama: form.nama.trim(),
    provider: form.provider.trim(),
    is_production: form.mode === 'production',
    merchant_id: form.merchant.trim(),
    key: form.key.trim(),
    secret: form.secret,
    webhook_verify_token: form.token.trim(),
    deskripsi: form.deskripsi.trim(),
    status: form.status
  }
  try {
    if (editingId.value) {
      await $fetch(`/api_web/credentials/${editingId.value}`, { method: 'PUT', body: payload })
      toast('Kredensial tersimpan.')
    } else {
      await $fetch('/api_web/credentials', { method: 'POST', body: payload })
      toast('Kredensial tersimpan.')
    }
    closeModal()
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
    ? `Hapus kredensial "${names[0]}"? Tindakan ini tidak dapat dibatalkan.`
    : `Hapus ${deletingIds.value.length} kredensial (${names.slice(0, 3).join(', ')}${names.length > 3 ? ', …' : ''})? Tindakan ini tidak dapat dibatalkan.`
})

async function confirmDelete() {
  try {
    if (deletingIds.value.length === 1) {
      await $fetch(`/api_web/credentials/${deletingIds.value[0]}`, { method: 'DELETE' })
      toast('Kredensial terhapus.')
    } else {
      const res = await $fetch<{ data: { diproses: number, dilewati: number } }>('/api_web/credentials/bulk-delete', { method: 'POST', body: { ids: deletingIds.value } })
      toast(res.data.dilewati ? `Terhapus ${res.data.diproses}, dilewati ${res.data.dilewati}.` : `Terhapus ${res.data.diproses} kredensial.`)
    }
    clearSelected()
    deleteOpen.value = false
    await load()
  } catch (err: any) {
    toast('Gagal menghapus: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

function openDetail(row: Cred) {
  detailRow.value = row
}

function stamp() {
  const d = new Date()
  const p = (n: number) => (n < 10 ? '0' : '') + n
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

async function exportExcel() {
  const data = sortRows(filtered()).map(r => ({
    Nama: r.nama, Provider: r.provider, Mode: r.is_production ? 'production' : 'sandbox',
    Status: r.status === 'nonaktif' ? 'Nonaktif' : 'Aktif',
    'Merchant ID': r.merchant_id || '', Key: r.key, Secret: r.secret,
    'Verify Token': r.webhook_verify_token || '', Deskripsi: r.deskripsi || '',
    Dibuat: fmtDate(r.created_at)
  }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Nama: '', Provider: '', Mode: '', Status: '', 'Merchant ID': '', Key: '', Secret: '', 'Verify Token': '', Deskripsi: '', Dibuat: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kredensial')
  XLSX.writeFile(wb, `kredensial-${stamp()}.xlsx`)
  toast(`Diekspor ${data.length} baris ke Excel.`)
}

function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Nama', 'Provider', 'Mode', 'Status', 'Merchant ID', 'Key', 'Secret', 'Verify Token', 'Deskripsi'],
    ['Midtrans Sandbox', 'midtrans', 'sandbox', 'aktif', 'M-001', 'SB-Mid-client-001', 'SB-Mid-secret-001', 'tok-sb-001', 'Akun sandbox pengembang'],
    ['DOKU Production', 'doku', 'production', 'nonaktif', 'D-001', 'DK-client-001', 'DK-secret-001', 'tok-dk-001', '']
  ]), 'Kredensial')
  XLSX.writeFile(wb, 'template-kredensial.xlsx')
  toast('Template diunduh.')
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
      const iProv = col('provider')
      const iMode = col('mode')
      const iMerch = col('merchant id', 'merchant')
      const iKey = col('key')
      const iSec = col('secret')
      const iTok = col('verify token', 'token')
      const iStatus = col('status')
      const iDesk = col('deskripsi', 'description', 'keterangan')
      if (iProv < 0 || iKey < 0 || iSec < 0) { toast('Kolom Provider, Key, Secret wajib ada.', 'error'); return }
      const rowsIn = aoa.slice(1).map(line => ({
        nama: String(iNama >= 0 ? line[iNama] ?? '' : ''),
        provider: String(line[iProv] ?? ''),
        is_production: String(iMode >= 0 ? line[iMode] ?? '' : '').trim().toLowerCase() === 'production',
        merchant_id: String(iMerch >= 0 ? line[iMerch] ?? '' : ''),
        key: String(line[iKey] ?? ''),
        secret: String(line[iSec] ?? ''),
        webhook_verify_token: String(iTok >= 0 ? line[iTok] ?? '' : ''),
        status: String(iStatus >= 0 ? line[iStatus] ?? '' : '').trim().toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
        deskripsi: String(iDesk >= 0 ? line[iDesk] ?? '' : '')
      }))
      const res = await $fetch<{ data: { ditambah: number, dilewati: number } }>('/api_web/credentials/bulk-import', { method: 'POST', body: { rows: rowsIn } })
      toast(`Impor selesai: ${res.data.ditambah} ditambah, ${res.data.dilewati} dilewati.`)
      await load()
    } catch (err: any) {
      toast('Gagal mengimpor: ' + (err?.message || 'berkas tidak valid'), 'error')
    }
  }
  reader.readAsArrayBuffer(file)
}

await load()
</script>
