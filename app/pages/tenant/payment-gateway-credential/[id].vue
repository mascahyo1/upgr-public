<template>
  <div v-if="!route.params.logId" data-testid="page-cred-detail" :data-id="id">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700">Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li><NuxtLink to="/tenant/payment-gateway-credential" class="hover:text-emerald-700">Kredensial Gateway</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Detail</li>
      </ol>
    </nav>

    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Detail Kredensial</h1>

    <div v-if="credTest" data-testid="cred-test-result" role="alert" :class="['mt-8 rounded-md border px-3 py-2 text-sm', credTest.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200']"><p class="font-semibold">{{ credTest.ok ? 'Kredensial valid.' : 'Kredensial bermasalah.' }}</p><p class="mt-1 text-xs">{{ credTest.provider }} • {{ credTest.mode }} • {{ fmtDate(credTest.checked_at) }} — {{ credTest.pesan }}</p></div>

    <div data-testid="cred-detail-card" class="mt-8 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <i class="fa-solid fa-key text-emerald-700" aria-hidden="true"></i>
        <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ missing ? 'Detail Kredensial' : row?.nama }}</span>
      </div>
      <div class="p-5">
      <dl data-testid="cred-detail-list" class="space-y-2 text-sm">
        <div v-if="missing" class="flex items-center gap-2 text-slate-500 dark:text-slate-400"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>Kredensial tidak ditemukan. Mungkin sudah dihapus.</div>
        <template v-else>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Nama</dt><dd class="font-medium text-slate-900 dark:text-white">{{ row?.nama }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Provider</dt><dd class="text-slate-700 dark:text-slate-300">{{ row?.provider }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Mode</dt><dd><span v-if="row?.is_production" class="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Production</span><span v-else class="inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Sandbox</span></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Status</dt><dd><span v-if="row?.status !== 'nonaktif'" class="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Aktif</span><span v-else class="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">Nonaktif</span></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Merchant ID</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row?.merchant_id || '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Key</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row?.key }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Secret</dt><dd class="font-mono text-xs tracking-widest">•••••••• <span class="text-slate-400">(disensor)</span></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Verify token</dt><dd class="font-mono text-xs tracking-widest"><template v-if="row?.webhook_verify_token">•••••••• <span class="text-slate-400">(disensor)</span></template><template v-else>-</template></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Deskripsi</dt><dd class="text-slate-700 dark:text-slate-300">{{ row?.deskripsi || '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Dibuat</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(row?.created_at) }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Diubah</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(row?.updated_at) }}</dd></div>
        </template>
      </dl>
      </div>
      <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <NuxtLink to="/tenant/payment-gateway-credential" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Kembali</NuxtLink>
        <button v-if="!missing" type="button" data-testid="cred-detail-edit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openEdit">Ubah</button>
        <button v-if="!missing" type="button" data-testid="cred-test-credential" :disabled="credTesting" class="rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 dark:text-emerald-400 dark:hover:bg-emerald-950" @click="ujiKredensial"><i class="fa-solid fa-bolt mr-1.5" aria-hidden="true"></i>Test kredensial</button>
      </div>
    </div>

    <hr class="my-10 border-slate-200 dark:border-slate-800" />

    <section id="webhook" data-testid="page-wh" aria-label="Webhook kredensial" class="scroll-mt-20">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Webhook</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Tujuan penerusan webhook untuk kredensial ini. Token disensor di layar, enkripsi menyusul.</p>
          <div data-testid="wh-prefix-info" class="mt-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <i class="fa-solid fa-circle-info mr-2" aria-hidden="true"></i><strong>Prefix kode transaksi:</strong> notifikasi hanya diteruskan ke webhook yang prefix-nya cocok dengan <em>awalan</em> kode transaksi (order_id), <strong>case-sensitive</strong> — mis. prefix <code class="font-mono">INV</code> cocok dengan <code class="font-mono">INV-1</code> tapi <strong>tidak</strong> dengan <code class="font-mono">inv-1</code>. Webhook ber-prefix kosong menerima semua kode transaksi.
          </div>
        </div>
      </div>
      <div class="mt-4 flex w-fit gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800" role="group" aria-label="Tampilan webhook dan log">
        <button type="button" data-testid="wh-tab-daftar" :aria-pressed="whTab === 'daftar' ? 'true' : 'false'" :class="whTab === 'daftar' ? 'rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white' : 'rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'" @click="whTab = 'daftar'">Daftar Webhook</button>
        <button type="button" data-testid="wh-tab-log" :aria-pressed="whTab === 'log' ? 'true' : 'false'" :class="whTab === 'log' ? 'rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white' : 'rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'" @click="whTab = 'log'">Log Router</button>
        <button type="button" data-testid="api-tab-plog" :aria-pressed="whTab === 'plog' ? 'true' : 'false'" :class="whTab === 'plog' ? 'rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white' : 'rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'" @click="whTab = 'plog'">Log Provider</button>
        <button type="button" data-testid="api-tab-log" :aria-pressed="whTab === 'api' ? 'true' : 'false'" :class="whTab === 'api' ? 'rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white' : 'rounded-md px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'" @click="whTab = 'api'">Log API</button>
      </div>
      <div v-show="whTab === 'daftar'" data-testid="wh-panel-daftar" role="tabpanel" aria-label="Daftar webhook">
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-testid="wh-template-btn" title="Unduh contoh template impor" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="downloadWhTemplate">
            <i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Template
          </button>
          <button type="button" data-testid="wh-import-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="triggerWhImport">
            <i class="fa-solid fa-file-import mr-1.5" aria-hidden="true"></i>Impor
          </button>
          <input ref="whImportFile" type="file" data-testid="wh-import-file" accept=".xlsx,.xls,.csv" class="hidden" @change="onWhImportFile" />
          <button type="button" data-testid="wh-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportWh">
            <i class="fa-solid fa-file-export mr-1.5" aria-hidden="true"></i>Ekspor Excel
          </button>
          <button type="button" data-testid="wh-add" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openWhForm(null)">
            <i class="fa-solid fa-plus mr-1.5" aria-hidden="true"></i>Tambah
          </button>
        </div>
        <div v-if="missing" data-testid="wh-empty-cred" class="mt-6 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">Induk kredensial tidak ditemukan di browser ini.</div>
        <div v-show="!missing" data-testid="wh-wrap">
          <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter webhook">
            <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
              <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
            </p>
            <form data-testid="wh-filter-form" @submit.prevent="applyWhFilter">
              <div class="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <label for="wh-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
                  <input id="wh-q" v-model="whFilter.q" data-testid="wh-q" type="search" placeholder="URL webhook" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
                </div>
                <div>
                  <label for="wh-status" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status</label>
                  <select id="wh-status" v-model="whFilter.status" data-testid="wh-status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                    <option value="">Semua</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                <button type="button" data-testid="wh-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetWhFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
                <button type="submit" data-testid="wh-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
              </div>
            </form>
          </section>
          <div v-if="whBulkCount > 0" data-testid="wh-bulkbar" class="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <span><strong data-testid="wh-selected-count">{{ whBulkCount }}</strong> dipilih</span>
            <button type="button" data-testid="wh-bulk-delete" class="rounded-md border border-red-400 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900" @click="openWhDelete(whSelectedIds)">Hapus</button>
            <button type="button" data-testid="wh-bulk-clear" class="ml-auto underline" @click="clearWhSelected">Batalkan pilihan</button>
          </div>
          <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Daftar webhook">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
              <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
                <select v-model.number="whState.perPage" data-testid="wh-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="whState.page = 1">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                </select>
              </label>
              <p class="text-xs text-slate-500 dark:text-slate-400">Shift+klik header = multi-sort</p>
              <button type="button" data-testid="wh-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="resetWhSort"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th class="w-10 px-4 py-3"><input v-model="whSelectAll" type="checkbox" data-testid="wh-select-all" aria-label="Pilih semua" class="h-4 w-4" /></th>
                    <th class="px-4 py-3"><button type="button" data-testid="wh-sort-nama" class="font-semibold hover:text-emerald-700" @click="cycleWhSort('nama', $event.shiftKey)">Nama <span data-testid="wh-sort-nama-ind">{{ whSortInd('nama') }}</span></button></th>
                    <th class="px-4 py-3"><button type="button" data-testid="wh-sort-url" class="font-semibold hover:text-emerald-700" @click="cycleWhSort('url', $event.shiftKey)">URL Webhook <span data-testid="wh-sort-url-ind">{{ whSortInd('url') }}</span></button></th>
                    <th class="px-4 py-3">Prefix</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Verify token</th>
                    <th class="px-4 py-3"><button type="button" data-testid="wh-sort-created" class="font-semibold hover:text-emerald-700" @click="cycleWhSort('created_at', $event.shiftKey)">Dibuat <span data-testid="wh-sort-created-ind">{{ whSortInd('created_at') }}</span></button></th>
                    <th class="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody data-testid="wh-rows">
                  <tr v-if="whPageRows.length === 0">
                    <td colspan="8" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ whEmptyText }}</td>
                  </tr>
                  <tr v-for="w in whPageRows" :key="w.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td class="px-4 py-3"><input v-model="whSelected[w.id]" type="checkbox" data-testid="wh-select" :data-id="w.id" :aria-label="'Pilih ' + (w.nama || w.url)" class="h-4 w-4" /></td>
                    <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ w.nama || '-' }}</td>
                    <td class="px-4 py-3 break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ w.url }}</td>
                    <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ w.prefix || '-' }}</td>
                    <td class="px-4 py-3"><UiBadge :text="w.is_active ? 'Aktif' : 'Nonaktif'" :tone="w.is_active ? 'emerald' : 'slate'" /></td>
                    <td class="px-4 py-3 font-mono text-xs tracking-widest">{{ w.verify_token ? '••••••••' : '-' }}</td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(w.created_at) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-1">
                        <button type="button" data-testid="wh-detail" :data-id="w.id" title="Detail" :aria-label="'Detail ' + (w.nama || w.url)" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="whDetailRow = w"><i class="fa-solid fa-eye" aria-hidden="true"></i></button>
                        <button type="button" data-testid="wh-test" :data-id="w.id" title="Uji kirim" :aria-label="'Uji kirim ' + (w.nama || w.url)" :disabled="whTesting[w.id]" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-700 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400" @click="ujiKirim(w)"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button>
                        <button type="button" data-testid="wh-edit" :data-id="w.id" title="Ubah" :aria-label="'Ubah ' + (w.nama || w.url)" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" @click="openWhForm(w)"><i class="fa-solid fa-edit" aria-hidden="true"></i></button>
                        <button type="button" data-testid="wh-delete" :data-id="w.id" title="Hapus" :aria-label="'Hapus ' + (w.nama || w.url)" class="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300" @click="openWhDelete([w.id])"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <UiPagination p="wh" :page="whState.page" :pages="whPages" :from="whFrom" :to="whTo" :total="whFiltered.length" @prev="whState.page--" @next="whState.page++" />
          </section>
        </div>
      </div>
      <div v-show="whTab === 'log'" data-testid="wh-panel-log" role="tabpanel" aria-label="Log Router">
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-testid="whlog-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportLogs">
            <i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Ekspor Excel
          </button>
        </div>
        <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter log webhook">
          <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
            <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
          </p>
          <form data-testid="whlog-filter-form" @submit.prevent="applyLogFilter">
            <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="whlog-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
                <input id="whlog-q" v-model="logFilter.q" data-testid="whlog-q" type="search" placeholder="Nama, URL, atau pesan" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label for="whlog-hasil" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Hasil</label>
                <select id="whlog-hasil" v-model="logFilter.hasil" data-testid="whlog-hasil" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                  <option value="">Semua</option>
                  <option value="terkirim">Terkirim</option>
                  <option value="gagal">Gagal</option>
                </select>
              </div>
              <div>
                <label for="whlog-dari" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal dari</label>
                <input id="whlog-dari" v-model="logFilter.dari" data-testid="whlog-dari" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label for="whlog-sampai" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal sampai</label>
                <input id="whlog-sampai" v-model="logFilter.sampai" data-testid="whlog-sampai" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <button type="button" data-testid="whlog-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetLogFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
              <button type="submit" data-testid="whlog-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
            </div>
          </form>
        </section>
        <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Riwayat pengiriman webhook">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
              <select v-model.number="logState.perPage" data-testid="whlog-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="logState.page = 1">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
            <button type="button" data-testid="whlog-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="logState.dir = 'desc'; logState.page = 1"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th class="px-4 py-3"><button type="button" data-testid="whlog-sort-created" class="font-semibold hover:text-emerald-700" @click="logState.dir = logState.dir === 'asc' ? 'desc' : 'asc'; logState.page = 1">Waktu <span data-testid="whlog-sort-created-ind">{{ logState.dir === 'asc' ? '▲' : '▼' }}</span></button></th>
                  <th class="px-4 py-3">Webhook</th>
                  <th class="px-4 py-3">Event</th>
                  <th class="px-4 py-3">Hasil</th>
                  <th class="px-4 py-3">HTTP</th>
                  <th class="px-4 py-3">Pesan</th>
                  <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody data-testid="whlog-rows">
                <tr v-if="logPageRows.length === 0">
                  <td colspan="7" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ logEmptyText }}</td>
                </tr>
                <tr v-for="l in logPageRows" :key="l.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(l.created_at) }}</td>
                  <td class="px-4 py-3"><div class="font-medium text-slate-900 dark:text-white">{{ l.nama || '-' }}</div><div class="break-all font-mono text-xs text-slate-500 dark:text-slate-400">{{ l.url }}</div></td>
                  <td class="px-4 py-3 text-slate-600 dark:text-slate-400">{{ l.event }}</td>
                  <td class="px-4 py-3"><UiBadge :text="l.hasil === 'terkirim' ? 'Terkirim' : 'Gagal'" :tone="l.hasil === 'terkirim' ? 'emerald' : 'red'" /></td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ l.http == null ? '-' : l.http }}</td>
                  <td class="px-4 py-3 text-slate-600 dark:text-slate-400" :title="l.pesan">{{ shortMsg(l.pesan) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <NuxtLink :to="`/tenant/payment-gateway-credential/${id}/webhook-log/${l.id}`" data-testid="whlog-detail" :data-id="l.id" title="Detail" :aria-label='"Detail log " + (l.nama || l.event || l.id)' class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"><i class="fa-solid fa-eye" aria-hidden="true"></i></NuxtLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <UiPagination p="whlog" :page="logState.page" :pages="logPages" :from="logFrom" :to="logTo" :total="logFiltered.length" @prev="logState.page--" @next="logState.page++" />
        </section>
      </div>
      <div v-show="whTab === 'plog'" data-testid="api-panel-plog" role="tabpanel" aria-label="Log Provider">
        <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter log provider">
          <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
            <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
          </p>
          <form data-testid="api-pfilter-form" @submit.prevent="applyApiPlFilter">
            <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="api-pq" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
                <input id="api-pq" v-model="apiPlFilter.q" data-testid="api-pq" type="search" placeholder="Provider, method, URL, atau pesan" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label for="api-phasil" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Hasil</label>
                <select id="api-phasil" v-model="apiPlFilter.hasil" data-testid="api-phasil" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                  <option value="">Semua</option>
                  <option value="berhasil">Berhasil</option>
                  <option value="gagal">Gagal</option>
                </select>
              </div>
              <div>
                <label for="api-pdari" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal dari</label>
                <input id="api-pdari" v-model="apiPlFilter.dari" data-testid="api-pdari" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label for="api-psampai" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal sampai</label>
                <input id="api-psampai" v-model="apiPlFilter.sampai" data-testid="api-psampai" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <button type="button" data-testid="api-pfilter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetApiPlFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
              <button type="submit" data-testid="api-pfilter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
            </div>
          </form>
        </section>
        <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Riwayat panggilan provider">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
              <select v-model.number="apiPlState.perPage" data-testid="api-pperpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="apiPlState.page = 1">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
            <button type="button" data-testid="api-psort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="apiPlState.dir = 'desc'; apiPlState.page = 1"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th class="px-4 py-3"><button type="button" data-testid="api-psort-created" class="font-semibold hover:text-emerald-700" @click="apiPlState.dir = apiPlState.dir === 'asc' ? 'desc' : 'asc'; apiPlState.page = 1">Waktu <span data-testid="api-psort-created-ind">{{ apiPlState.dir === 'asc' ? '▲' : '▼' }}</span></button></th>
                  <th class="px-4 py-3">Provider</th>
                  <th class="px-4 py-3">Method</th>
                  <th class="px-4 py-3">URL</th>
                  <th class="px-4 py-3">Hasil</th>
                  <th class="px-4 py-3">HTTP</th>
                  <th class="px-4 py-3">Durasi</th>
                  <th class="px-4 py-3">Pesan</th>
                  <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody data-testid="api-prow-rows">
                <tr v-if="apiPlPageRows.length === 0">
                  <td colspan="9" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ apiPlEmptyText }}</td>
                </tr>
                <tr v-for="p in apiPlPageRows" :key="p.id" data-testid="api-prow" :data-id="p.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(p.created_at) }}</td>
                  <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ p.provider || '-' }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ p.method || '-' }}</td>
                  <td class="break-all px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{{ p.url }}</td>
                  <td class="px-4 py-3"><UiBadge :text="apiHasilText(p.hasil)" :tone="apiHasilTone(p.hasil)" /></td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ p.http == null ? '-' : p.http }}</td>
                  <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ p.durasi_ms == null ? '-' : p.durasi_ms + ' ms' }}</td>
                  <td class="px-4 py-3 text-slate-600 dark:text-slate-400" :title="p.pesan">{{ shortMsg(p.pesan) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <NuxtLink :to="`/tenant/payment-gateway-credential/${id}/provider-log/${p.id}`" data-testid="api-prow-detail" :data-id="p.id" title="Detail" :aria-label='"Detail panggilan " + (p.provider || "provider") + " " + (p.method || "")' class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"><i class="fa-solid fa-eye" aria-hidden="true"></i></NuxtLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <UiPagination p="apipl" :page="apiPlState.page" :pages="apiPlPages" :from="apiPlFrom" :to="apiPlTo" :total="apiPlFiltered.length" @prev="apiPlState.page--" @next="apiPlState.page++" />
        </section>
      </div>
      <div v-show="whTab === 'api'" data-testid="api-panel-log" role="tabpanel" aria-label="Log API">
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-testid="api-export-btn" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" @click="exportApiLogs">
            <i class="fa-solid fa-file-arrow-down mr-1.5" aria-hidden="true"></i>Ekspor Excel
          </button>
        </div>
        <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Filter log API">
          <p class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
            <i class="fa-solid fa-filter text-emerald-700" aria-hidden="true"></i>Filter
          </p>
          <form data-testid="api-filter-form" @submit.prevent="applyApiFilter">
            <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="api-q" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Cari</label>
                <input id="api-q" v-model="apiFilter.q" data-testid="api-q" type="search" placeholder="Provider, method, URL, atau pesan" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label for="api-hasil" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Hasil</label>
                <select id="api-hasil" v-model="apiFilter.hasil" data-testid="api-hasil" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                  <option value="">Semua</option>
                  <option value="berhasil">Berhasil</option>
                  <option value="gagal">Gagal</option>
                </select>
              </div>
              <div>
                <label for="api-dari" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal dari</label>
                <input id="api-dari" v-model="apiFilter.dari" data-testid="api-dari" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div>
                <label for="api-sampai" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Tanggal sampai</label>
                <input id="api-sampai" v-model="apiFilter.sampai" data-testid="api-sampai" type="date" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
              <button type="button" data-testid="api-filter-reset" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetApiFilter"><i class="fa-solid fa-rotate-left mr-1.5" aria-hidden="true"></i>Reset</button>
              <button type="submit" data-testid="api-filter-apply" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"><i class="fa-solid fa-magnifying-glass mr-1.5" aria-hidden="true"></i>Filter</button>
            </div>
          </form>
        </section>
        <section class="mt-4 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Riwayat panggilan API">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
            <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">Tampilkan
              <select v-model.number="apiState.perPage" data-testid="api-perpage" class="rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" @change="apiState.page = 1">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
            <button type="button" data-testid="api-sort-reset" title="Reset sorting" class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800" @click="apiState.dir = 'desc'; apiState.page = 1"><i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Reset sorting</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th class="px-4 py-3"><button type="button" data-testid="api-sort-created" class="font-semibold hover:text-emerald-700" @click="apiState.dir = apiState.dir === 'asc' ? 'desc' : 'asc'; apiState.page = 1">Waktu <span data-testid="api-sort-created-ind">{{ apiState.dir === 'asc' ? '▲' : '▼' }}</span></button></th>
                  <th class="px-4 py-3">Provider</th>
                  <th class="px-4 py-3">Method</th>
                  <th class="px-4 py-3">URL</th>
                  <th class="px-4 py-3">Hasil</th>
                  <th class="px-4 py-3">HTTP</th>
                  <th class="px-4 py-3">Durasi</th>
                  <th class="px-4 py-3">Pesan</th>
                  <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody data-testid="api-rows">
                <tr v-if="apiPageRows.length === 0">
                  <td colspan="9" class="px-4 py-10 text-center text-slate-500 dark:text-slate-400"><i class="fa-solid fa-inbox mr-2" aria-hidden="true"></i>{{ apiEmptyText }}</td>
                </tr>
                <tr v-for="l in apiPageRows" :key="l.id" class="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td class="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{{ fmtDate(l.created_at) }}</td>
                  <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ l.provider || '-' }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ l.method || '-' }}</td>
                  <td class="break-all px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{{ l.url }}</td>
                  <td class="px-4 py-3"><UiBadge :text="apiHasilText(l.hasil)" :tone="apiHasilTone(l.hasil)" /></td>
                  <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ l.http == null ? '-' : l.http }}</td>
                  <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{{ l.durasi_ms == null ? '-' : l.durasi_ms + ' ms' }}</td>
                  <td class="px-4 py-3 text-slate-600 dark:text-slate-400" :title="l.pesan">{{ shortMsg(l.pesan) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <NuxtLink :to="`/tenant/payment-gateway-credential/${id}/api-log/${l.id}`" data-testid="api-detail" :data-id="l.id" title="Detail" :aria-label="'Detail panggilan ' + (l.provider || 'API') + ' ' + (l.method || '')" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"><i class="fa-solid fa-eye" aria-hidden="true"></i></NuxtLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <UiPagination p="api" :page="apiState.page" :pages="apiPages" :from="apiFrom" :to="apiTo" :total="apiFiltered.length" @prev="apiState.page--" @next="apiState.page++" />
        </section>
      </div>
    </section>
  </div>

  <NuxtPage />

  <UiModal v-if="editOpen && row" p="cred-edit" title="Ubah Kredensial" @close="editOpen = false" @backdrop="editOpen = false">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="cred-edit-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(editErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(editErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in editErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="cred-edit-form" novalidate @submit.prevent="submitEdit">
        <div class="space-y-4">
          <div>
            <label for="cred-edit-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama <span class="text-red-500">*</span></label>
            <input id="cred-edit-nama" v-model="form.nama" data-testid="cred-edit-nama" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': editErrs.nama }" />
            <p data-testid="cred-edit-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', editErrs.nama ? '' : 'hidden']">{{ editErrs.nama }}</p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="cred-edit-provider" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Provider <span class="text-red-500">*</span></label>
              <select id="cred-edit-provider" v-model="form.provider" data-testid="cred-edit-provider" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': editErrs.provider }">
                <option value="" disabled>Pilih provider</option>
                <option value="midtrans">Midtrans</option>
                <option value="doku">DOKU</option>
                <option value="xendit">Xendit</option>
                <option value="stripe">Stripe</option>
              </select>
              <p data-testid="cred-edit-provider-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', editErrs.provider ? '' : 'hidden']">{{ editErrs.provider }}</p>
            </div>
            <div>
              <label for="cred-edit-mode" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Mode <span class="text-red-500">*</span></label>
              <select id="cred-edit-mode" v-model="form.mode" data-testid="cred-edit-mode" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label for="cred-edit-status" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status <span class="text-red-500">*</span></label>
              <select id="cred-edit-status" v-model="form.status" data-testid="cred-edit-status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': editErrs.status }">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
              <p data-testid="cred-edit-status-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', editErrs.status ? '' : 'hidden']">{{ editErrs.status }}</p>
            </div>
          </div>
          <div>
            <label for="cred-edit-merchant" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Merchant ID</label>
            <input id="cred-edit-merchant" v-model="form.merchant" data-testid="cred-edit-merchant" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="cred-edit-key" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Key <span class="text-red-500">*</span></label>
            <input id="cred-edit-key" v-model="form.key" data-testid="cred-edit-key" type="text" maxlength="200" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': editErrs.key }" />
            <p data-testid="cred-edit-key-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', editErrs.key ? '' : 'hidden']">{{ editErrs.key }}</p>
          </div>
          <div>
            <label for="cred-edit-secret" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Secret <span class="text-red-500">*</span></label>
            <input id="cred-edit-secret" v-model="form.secret" data-testid="cred-edit-secret" type="password" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': editErrs.secret }" />
            <p data-testid="cred-edit-secret-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', editErrs.secret ? '' : 'hidden']">{{ editErrs.secret }}</p>
          </div>
          <div>
            <label for="cred-edit-token" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Webhook verify token</label>
            <input id="cred-edit-token" v-model="form.token" data-testid="cred-edit-token" type="text" maxlength="200" autocomplete="off" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
          </div>
          <div>
            <label for="cred-edit-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
            <textarea id="cred-edit-deskripsi" v-model="form.deskripsi" data-testid="cred-edit-deskripsi" rows="2" maxlength="500" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950"></textarea>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="cred-edit-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="editOpen = false">Batal</button>
      <button type="button" data-testid="cred-edit-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitEdit">Simpan</button>
    </div>
  </UiModal>

  <UiModal v-if="whModalOpen" p="wh" :title="whEditingId ? 'Ubah Webhook' : 'Tambah Webhook'" @close="whModalOpen = false" @backdrop="whModalOpen = false">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="wh-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(whFormErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(whFormErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in whFormErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="wh-form" novalidate @submit.prevent="submitWhForm">
        <div class="space-y-4">
          <div>
            <label for="wh-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama webhook</label>
            <input id="wh-nama" v-model="whForm.nama" data-testid="wh-nama" type="text" maxlength="100" placeholder="mis. Penerusan ERP" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': whFormErrs.nama }" />
            <p data-testid="wh-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', whFormErrs.nama ? '' : 'hidden']">{{ whFormErrs.nama }}</p>
          </div>
          <div>
            <label for="wh-url" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">URL webhook <span class="text-red-500">*</span></label>
            <input id="wh-url" v-model="whForm.url" data-testid="wh-url" type="url" placeholder="https://app.contoh.id/hook" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': whFormErrs.url }" />
            <p data-testid="wh-url-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', whFormErrs.url ? '' : 'hidden']">{{ whFormErrs.url }}</p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="wh-active" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status <span class="text-red-500">*</span></label>
              <select id="wh-active" v-model="whForm.active" data-testid="wh-active" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
              <p data-testid="wh-active-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', whFormErrs.active ? '' : 'hidden']">{{ whFormErrs.active }}</p>
            </div>
            <div>
              <label for="wh-prefix" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Prefix kode transaksi / tagihan</label>
              <input id="wh-prefix" v-model="whForm.prefix" data-testid="wh-prefix" type="text" maxlength="20" placeholder="opsional, mis. ERP-" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': whFormErrs.prefix }" />
              <p data-testid="wh-prefix-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', whFormErrs.prefix ? '' : 'hidden']">{{ whFormErrs.prefix }}</p>
            </div>
          </div>
          <div>
            <label for="wh-token" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Webhook verify token</label>
            <div class="flex gap-2">
              <input id="wh-token" v-model="whForm.token" data-testid="wh-token" type="text" maxlength="200" autocomplete="off" placeholder="opsional, bisa generate" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': whFormErrs.token }" />
              <button type="button" data-testid="wh-generate" aria-label="Generate token" title="Generate token" class="shrink-0 rounded-md border border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="generateWhToken">
                <i class="fa-solid fa-dice" aria-hidden="true"></i>
              </button>
            </div>
            <p data-testid="wh-token-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', whFormErrs.token ? '' : 'hidden']">{{ whFormErrs.token }}</p>
          </div>
          <div>
            <label for="wh-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
            <textarea id="wh-deskripsi" v-model="whForm.deskripsi" data-testid="wh-deskripsi" rows="2" maxlength="500" placeholder="opsional, mis. Meneruskan pembayaran QRIS ke ERP" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950"></textarea>
            <p data-testid="wh-deskripsi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', whFormErrs.deskripsi ? '' : 'hidden']">{{ whFormErrs.deskripsi }}</p>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="wh-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="whModalOpen = false">Batal</button>
      <button type="button" data-testid="wh-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitWhForm">Simpan</button>
    </div>
  </UiModal>

  <UiModal v-if="whDeleteOpen" p="wh-delete" title="Hapus webhook?" max-w="max-w-md" @close="whDeleteOpen = false" @backdrop="whDeleteOpen = false">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <p data-testid="wh-delete-text" class="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">{{ whDeleteText }}</p>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="wh-delete-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="whDeleteOpen = false">Batal</button>
      <button type="button" data-testid="wh-delete-confirm" class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="confirmWhDelete">Hapus</button>
    </div>
  </UiModal>

  <UiModal v-if="whDetailRow" p="wh-detail" title="Detail Webhook" max-w="max-w-lg" @close="whDetailRow = null" @backdrop="whDetailRow = null">
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
      <dl data-testid="wh-detail-body" class="space-y-2 text-sm">
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Nama</dt><dd class="font-medium text-slate-900 dark:text-white">{{ whDetailRow.nama || '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">URL</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ whDetailRow.url }}</dd></div>
        <template v-if="whDetailRow">
          <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Prefix</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ whDetailRow.prefix || '-' }}</dd></div>
          <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Deskripsi</dt><dd class="text-slate-700 dark:text-slate-300">{{ whDetailRow.deskripsi || '-' }}</dd></div>
          <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Status</dt><dd><UiBadge :text="whDetailRow.is_active ? 'Aktif' : 'Nonaktif'" :tone="whDetailRow.is_active ? 'emerald' : 'slate'" /></dd></div>
          <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Verify token</dt><dd class="font-mono text-xs tracking-widest">{{ whDetailRow.verify_token ? '•••••••• (disensor)' : '-' }}</dd></div>
        </template>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Dibuat</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(whDetailRow.created_at) }}</dd></div>
        <div v-if="whDetailRow" class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Diubah</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(whDetailRow.updated_at) }}</dd></div>
      </dl>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="wh-detail-close" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="whDetailRow = null">Tutup</button>
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

const route = useRoute()
const id = route.params.id as string
const { toast } = useToast()
const row = ref<Cred | null>(null)
const missing = ref(false)
const editOpen = ref(false)
const form = reactive({ nama: '', provider: '', mode: 'sandbox', status: 'aktif', merchant: '', key: '', secret: '', token: '', deskripsi: '' })
const editErrs = reactive<Record<string, string>>({})

function fmtDate(iso: string | undefined) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso || '-' }
}

async function load() {
  try {
    const res = await $fetch<{ data: Cred }>(`/api_web/credentials/${id}`)
    row.value = res.data
  } catch {
    missing.value = true
  }
}

function validateLocal() {
  const e: Record<string, string> = {}
  if (!form.nama.trim()) e.nama = 'Nama wajib diisi.'
  else if (form.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (!form.provider.trim()) e.provider = 'Provider wajib diisi.'
  else if (!/^[a-z0-9][a-z0-9_-]{1,29}$/.test(form.provider.trim().toLowerCase())) e.provider = 'Provider 2-30 karakter: huruf kecil, angka, dash, underscore.'
  if (!form.key.trim()) e.key = 'Key wajib diisi.'
  else if (form.key.trim().length < 4) e.key = 'Key minimal 4 karakter.'
  else if (form.key.trim().length > 200) e.key = 'Key maksimal 200 karakter.'
  if (!form.secret) e.secret = 'Secret wajib diisi.'
  else if (form.secret.length < 4) e.secret = 'Secret minimal 4 karakter.'
  else if (form.secret.length > 200) e.secret = 'Secret maksimal 200 karakter.'
  if (form.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  if (form.status !== 'aktif' && form.status !== 'nonaktif') e.status = 'Status tidak valid.'
  return e
}

function openEdit() {
  if (!row.value) return
  form.nama = row.value.nama
  form.provider = row.value.provider
  form.mode = row.value.is_production ? 'production' : 'sandbox'
  form.status = row.value.status === 'nonaktif' ? 'nonaktif' : 'aktif'
  form.merchant = row.value.merchant_id
  form.key = row.value.key
  form.secret = row.value.secret
  form.token = row.value.webhook_verify_token
  form.deskripsi = row.value.deskripsi
  for (const k of Object.keys(editErrs)) delete editErrs[k]
  editOpen.value = true
}

async function submitEdit() {
  const errs = validateLocal()
  for (const k of Object.keys(editErrs)) delete editErrs[k]
  Object.assign(editErrs, errs)
  if (Object.keys(errs).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  try {
    const res = await $fetch<{ data: Cred }>(`/api_web/credentials/${id}`, {
      method: 'PUT',
      body: {
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
    })
    row.value = res.data
    editOpen.value = false
    toast('Kredensial tersimpan.')
  } catch (err: any) {
    const serverErrs = err?.data?.data?.errors
    if (serverErrs) {
      Object.assign(editErrs, serverErrs)
      toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    } else {
      toast('Gagal menyimpan: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
  }
}

interface Webhook {
  id: string
  url: string
  nama: string
  prefix: string
  is_active: boolean
  verify_token: string
  deskripsi: string
  created_at: string
  updated_at: string
}

interface ApiLog {
  id: string
  credential_id: string
  provider: string
  method: string
  url: string
  http: number | null
  durasi_ms: number | null
  hasil: string
  pesan: string
  request_ringkas: string
  response_ringkas: string
  created_at: string
}

interface WebhookLog {
  id: string
  webhook_id: string
  nama: string
  url: string
  event: string
  hasil: string
  http: number | null
  pesan: string
  request_header?: string
  request_body?: string
  response_header?: string
  response_body?: string
  created_at: string
}

interface ProviderLog {
  id: string
  credential_id: string
  provider: string
  method: string
  url: string
  http: number | null
  durasi_ms: number | null
  hasil: string
  pesan: string
  request_header?: string
  request_body?: string
  response_header?: string
  response_body?: string
  created_at: string
}

const whTab = ref<'daftar' | 'log' | 'plog' | 'api'>('daftar')
const whRows = ref<Webhook[]>([])
const whState = reactive({ q: '', status: '', page: 1, perPage: 10, sorts: [] as Array<{ key: string, dir: 'asc' | 'desc' }> })
const whFilter = reactive({ q: '', status: '' })
const whSelected = reactive<Record<string, boolean>>({})
const whSelectAll = ref(false)
const whModalOpen = ref(false)
const whEditingId = ref<string | null>(null)
const whDeleteOpen = ref(false)
const whDeletingIds = ref<string[]>([])
const whDetailRow = ref<Webhook | null>(null)


const whTesting = reactive<Record<string, boolean>>({})
const whForm = reactive({ nama: '', url: '', active: 'aktif', prefix: '', token: '', deskripsi: '' })
const whFormErrs = reactive<Record<string, string>>({})
const whImportFile = ref<HTMLInputElement | null>(null)

const logRows = ref<WebhookLog[]>([])
const logState = reactive({ q: '', hasil: '', dari: '', sampai: '', page: 1, perPage: 10, dir: 'desc' as 'asc' | 'desc' })
const logFilter = reactive({ q: '', hasil: '', dari: '', sampai: '' })

const apiRows = ref<ApiLog[]>([])
const apiState = reactive({ q: '', hasil: '', dari: '', sampai: '', page: 1, perPage: 10, dir: 'desc' as 'asc' | 'desc' })
const apiFilter = reactive({ q: '', hasil: '', dari: '', sampai: '' })

const apiPlRows = ref<ProviderLog[]>([])
const apiPlState = reactive({ q: '', hasil: '', dari: '', sampai: '', page: 1, perPage: 10, dir: 'desc' as 'asc' | 'desc' })
const apiPlFilter = reactive({ q: '', hasil: '', dari: '', sampai: '' })

const whEmptyText = computed(() => {
  if (whRows.value.length === 0) return 'Belum ada webhook untuk kredensial ini. Tambahkan tujuan pertama.'
  return 'Tidak ada hasil. Ubah filter atau tambah webhook baru.'
})
const logEmptyText = computed(() => {
  if (logRows.value.length === 0 && !logState.q && !logState.hasil && !logState.dari && !logState.sampai) return 'Belum ada log. Klik Uji kirim pada baris webhook untuk mencatat hasil pengiriman.'
  return 'Tidak ada hasil. Ubah filter log.'
})

const apiEmptyText = computed(() => {
  if (apiRows.value.length === 0 && !apiState.q && !apiState.hasil && !apiState.dari && !apiState.sampai) return 'Belum ada log API. Klik Test kredensial di atas untuk mencatat hasil pemanggilan provider.'
  return 'Tidak ada hasil. Ubah filter log API.'
})

const apiPlEmptyText = computed(() => {
  if (apiPlRows.value.length === 0 && !apiPlState.q && !apiPlState.hasil && !apiPlState.dari && !apiPlState.sampai) return 'Belum ada log provider untuk kredensial ini.'
  return 'Tidak ada hasil. Ubah filter log provider.'
})

function apiHasilText(h: string) {
  const s = String(h || '')
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '-'
}

function apiHasilTone(h: string): 'emerald' | 'red' {
  return ['berhasil', 'terkirim', 'sukses', 'ok'].indexOf(String(h || '').toLowerCase()) >= 0 ? 'emerald' : 'red'
}

function shortMsg(pesan: string) {
  const s = String(pesan || '')
  return s.length > 80 ? s.slice(0, 80) + '…' : s
}

async function loadWh() {
  if (missing.value) return
  try {
    const res = await $fetch<{ data: Webhook[] }>(`/api_web/credentials/${id}/webhooks`)
    whRows.value = res.data
  } catch { /* induk mungkin terhapus */ }
}

async function loadLogs() {
  try {
    const res = await $fetch<{ data: WebhookLog[] }>(`/api_web/credentials/${id}/logs`)
    logRows.value = res.data
  } catch { /* abaikan */ }
}

async function loadApiLogs() {
  try {
    const res = await $fetch<{ data: ApiLog[] }>(`/api_web/credentials/${id}/api-logs?limit=100`)
    apiRows.value = Array.isArray(res.data) ? res.data : []
  } catch { /* endpoint daftar menyusul dari writer server; tabel tetap kosong */ }
}

async function loadProviderLogs() {
  try {
    const res = await $fetch<{ data: ProviderLog[] }>(`/api_web/credentials/${id}/provider-logs?limit=100`)
    apiPlRows.value = Array.isArray(res.data) ? res.data : []
  } catch { /* endpoint provider-logs menyusul dari writer server; tabel tetap kosong */ }
}


function whFiltered() {
  const s = whState.q.trim().toLowerCase()
  return whRows.value.filter((r) => {
    if (whState.status && (r.is_active ? 'aktif' : 'nonaktif') !== whState.status) return false
    if (s && ((r.nama || '') + ' ' + r.url + ' ' + (r.prefix || '') + ' ' + (r.deskripsi || '')).toLowerCase().indexOf(s) < 0) return false
    return true
  })
}

function whSortRows(list: Webhook[]) {
  if (!whState.sorts.length) return list.slice().sort((a, b) => a.created_at < b.created_at ? 1 : -1)
  return list.slice().sort((a, b) => {
    for (const srt of whState.sorts) {
      const av = String((a as any)[srt.key] ?? '').toLowerCase()
      const bv = String((b as any)[srt.key] ?? '').toLowerCase()
      if (av < bv) return srt.dir === 'asc' ? -1 : 1
      if (av > bv) return srt.dir === 'asc' ? 1 : -1
    }
    return 0
  })
}

function cycleWhSort(key: string, additive: boolean) {
  const idx = whState.sorts.findIndex(s => s.key === key)
  const cur = idx >= 0 ? whState.sorts[idx] : undefined
  if (!additive) {
    let dir: 'asc' | 'desc' = 'asc'
    if (idx === 0 && whState.sorts.length === 1) dir = whState.sorts[0]?.dir === 'asc' ? 'desc' : 'asc'
    else if (cur) dir = cur.dir === 'asc' ? 'desc' : 'asc'
    whState.sorts = [{ key, dir }]
  } else {
    if (cur) cur.dir = cur.dir === 'asc' ? 'desc' : 'asc'
    else whState.sorts.push({ key, dir: 'asc' })
  }
  whState.page = 1
}

function whSortInd(key: string) {
  const i = whState.sorts.findIndex(s => s.key === key)
  if (i < 0) return ''
  return (whState.sorts[i]?.dir === 'asc' ? '▲' : '▼') + (whState.sorts.length > 1 ? String(i + 1) : '')
}

function resetWhSort() {
  whState.sorts = []
  whState.page = 1
}

const whPages = computed(() => Math.max(1, Math.ceil(whFiltered().length / whState.perPage)))
const whFrom = computed(() => whFiltered().length === 0 ? 0 : (whState.page - 1) * whState.perPage + 1)
const whTo = computed(() => Math.min(whState.page * whState.perPage, whFiltered().length))
const whPageRows = computed(() => {
  const list = whSortRows(whFiltered())
  if (whState.page > whPages.value) whState.page = whPages.value
  return list.slice((whState.page - 1) * whState.perPage, whState.page * whState.perPage)
})

const whSelectedIds = computed(() => Object.keys(whSelected).filter(k => whSelected[k]))
const whBulkCount = computed(() => whSelectedIds.value.length)

watch(whSelectAll, (v) => {
  for (const r of whPageRows.value) whSelected[r.id] = v
})

function clearWhSelected() {
  for (const k of Object.keys(whSelected)) delete whSelected[k]
  whSelectAll.value = false
}

function applyWhFilter() {
  whState.q = whFilter.q
  whState.status = whFilter.status
  whState.page = 1
}

function resetWhFilter() {
  whFilter.q = ''
  whFilter.status = ''
  whState.q = ''
  whState.status = ''
  whState.page = 1
}

function isHttpUrl(u: string) {
  const m = /^https?:\/\/([^/\s]+)(\/\S*)?$/.exec(u)
  if (!m) return false
  const host = (m[1] ?? '').split(':')[0]?.toLowerCase() ?? ''
  if (host === 'localhost') return true
  return host.indexOf('.') >= 0
}

function validateWhLocal() {
  const e: Record<string, string> = {}
  const url = whForm.url.trim()
  if (!url) e.url = 'URL webhook wajib diisi.'
  else if (!isHttpUrl(url)) e.url = 'URL harus diawali http(s):// dengan host valid.'
  else if (url.length > 500) e.url = 'URL maksimal 500 karakter.'
  if (whForm.token.trim().length > 200) e.token = 'Token maksimal 200 karakter.'
  if (whForm.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (whForm.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  const p = whForm.prefix.trim()
  if (p.length > 20) e.prefix = 'Prefix maksimal 20 karakter.'
  else if (/\s/.test(p)) e.prefix = 'Prefix tidak boleh mengandung spasi.'
  return e
}

function openWhForm(w: Webhook | null) {
  whEditingId.value = w ? w.id : null
  whForm.nama = w?.nama || ''
  whForm.url = w?.url || ''
  whForm.active = w ? (w.is_active ? 'aktif' : 'nonaktif') : 'aktif'
  whForm.prefix = w?.prefix || ''
  whForm.token = w?.verify_token || ''
  whForm.deskripsi = w?.deskripsi || ''
  for (const k of Object.keys(whFormErrs)) delete whFormErrs[k]
  whModalOpen.value = true
}

function generateWhToken() {
  const hex = '0123456789abcdef'
  let out = ''
  try {
    const buf = new Uint8Array(16)
    crypto.getRandomValues(buf)
    for (const b of buf) out += (hex[b >> 4] ?? '') + (hex[b & 15] ?? '')
  } catch {
    for (let i = 0; i < 32; i++) out += hex[Math.floor(Math.random() * 16)] ?? ''
  }
  whForm.token = out
}

async function submitWhForm() {
  const errs = validateWhLocal()
  for (const k of Object.keys(whFormErrs)) delete whFormErrs[k]
  Object.assign(whFormErrs, errs)
  if (Object.keys(errs).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  const payload = {
    nama: whForm.nama.trim(),
    url: whForm.url.trim(),
    is_active: whForm.active,
    prefix: whForm.prefix.trim(),
    verify_token: whForm.token.trim(),
    deskripsi: whForm.deskripsi.trim()
  }
  try {
    if (whEditingId.value) {
      await $fetch(`/api_web/credentials/${id}/webhooks/${whEditingId.value}`, { method: 'PUT', body: payload })
    } else {
      await $fetch(`/api_web/credentials/${id}/webhooks`, { method: 'POST', body: payload })
    }
    toast('Webhook tersimpan.')
    whModalOpen.value = false
    await loadWh()
  } catch (err: any) {
    const serverErrs = err?.data?.data?.errors
    if (serverErrs) {
      Object.assign(whFormErrs, serverErrs)
      toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    } else {
      toast('Gagal menyimpan: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
  }
}

function openWhDelete(ids: string[]) {
  whDeletingIds.value = ids.slice()
  whDeleteOpen.value = true
}

const whDeleteText = computed(() => {
  const names = whDeletingIds.value.map(wid => whRows.value.find(r => r.id === wid)?.nama || whRows.value.find(r => r.id === wid)?.url || wid)
  return whDeletingIds.value.length === 1
    ? `Hapus webhook "${names[0]}"? Tindakan ini tidak dapat dibatalkan.`
    : `Hapus ${whDeletingIds.value.length} webhook? Tindakan ini tidak dapat dibatalkan.`
})

async function confirmWhDelete() {
  try {
    if (whDeletingIds.value.length === 1) {
      await $fetch(`/api_web/credentials/${id}/webhooks/${whDeletingIds.value[0]}`, { method: 'DELETE' })
      toast('Webhook terhapus.')
    } else {
      const res = await $fetch<{ data: { diproses: number, dilewati: number } }>(`/api_web/credentials/${id}/webhooks/bulk-delete`, { method: 'POST', body: { ids: whDeletingIds.value } })
      toast(res.data.dilewati ? `Terhapus ${res.data.diproses}, dilewati ${res.data.dilewati}.` : `Terhapus ${res.data.diproses} webhook.`)
    }
    clearWhSelected()
    whDeleteOpen.value = false
    await loadWh()
  } catch (err: any) {
    toast('Gagal menghapus: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

async function kirimUji(w: Webhook): Promise<{ ok: boolean, http: number | null, note: string }> {
  // Sumber kontrak: server/api_web/credentials/[id]/webhooks/[wid]/test.post.ts.
  // DIMODIFIKASI: pengiriman lewat server (bebas CORS) — browser hanya memicu.
  try {
    const res = await $fetch<{ data: { hasil: string, http: number | null } }>(`/api_web/credentials/${id}/webhooks/${w.id}/test`, { method: 'POST' })
    const ok = res.data.hasil === 'terkirim'
    return { ok, http: res.data.http, note: ok ? `terkirim (HTTP ${res.data.http ?? '?'})` : `gagal${res.data.http ? ` (HTTP ${res.data.http})` : ''}` }
  } catch (err: any) {
    const errs = err?.data?.data?.errors
    return { ok: false, http: null, note: 'gagal: ' + (errs ? Object.values(errs).join(' ') : err?.data?.data?.error || err?.message || 'kesalahan jaringan') }
  }
}

async function ujiKirim(w: Webhook) {
  whTesting[w.id] = true
  try {
    const r = await kirimUji(w)
    toast(`Uji kirim ${r.note}.`, r.ok ? 'ok' : 'error')
  } finally {
    whTesting[w.id] = false
    await loadLogs()
  }
}

const credTesting = ref(false)
const credTest = ref<{ ok: boolean, provider: string, mode: string, http: number | null, pesan: string, checked_at: string } | null>(null)

async function ujiKredensial() {
  if (credTesting.value) return
  credTesting.value = true
  try {
    const res = await $fetch<{ data: { ok: boolean, provider: string, mode: string, http: number | null, pesan: string, checked_at: string } }>(`/api_web/credentials/${id}/test`, { method: 'POST' })
    credTest.value = res.data
    toast(res.data.ok ? 'Kredensial valid.' : 'Kredensial bermasalah: ' + res.data.pesan, res.data.ok ? 'ok' : 'error')
  } catch (err: any) {
    const errs = err?.data?.data?.errors
    credTest.value = null
    toast('Uji kredensial gagal: ' + (errs ? Object.values(errs).join(' ') : err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  } finally {
    credTesting.value = false
    await loadApiLogs()
  }
}

function whStamp() {
  const d = new Date()
  const p = (n: number) => (n < 10 ? '0' : '') + n
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

async function exportWh() {
  const data = whSortRows(whFiltered()).map(r => ({
    Nama: r.nama || '', URL: r.url, Prefix: r.prefix || '', Status: r.is_active ? 'aktif' : 'nonaktif',
    Token: r.verify_token || '', Deskripsi: r.deskripsi || '', Dibuat: fmtDate(r.created_at)
  }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Nama: '', URL: '', Prefix: '', Status: '', Token: '', Deskripsi: '', Dibuat: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Webhook')
  XLSX.writeFile(wb, `webhook-${whStamp()}.xlsx`)
  toast(`Diekspor ${data.length} webhook ke Excel.`)
}

function downloadWhTemplate() {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
    ['Nama', 'URL', 'Prefix', 'Status', 'Token', 'Deskripsi'],
    ['Penerusan ERP', 'https://erp.contoh.id/hook', 'ERP-', 'aktif', 'tok-erp', 'Meneruskan pembayaran ke ERP'],
    ['Penerusan BIS', 'https://bis.contoh.id/hook', '', 'nonaktif', '', '']
  ]), 'Webhook')
  XLSX.writeFile(wb, 'template-webhook.xlsx')
  toast('Template impor webhook diunduh.')
}

function triggerWhImport() {
  whImportFile.value?.click()
}

function onWhImportFile(e: Event) {
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
      const iUrl = col('url', 'webhook', 'webhook_url') >= 0 ? col('url', 'webhook', 'webhook_url') : -1
      const iPrefix = col('prefix', 'prefix kode', 'kode prefix')
      const iStatus = col('status')
      const iTok = col('token', 'verify token')
      const iDesk = col('deskripsi', 'description', 'keterangan')
      if (iUrl < 0) { toast('Header tidak dikenali. Butuh kolom URL.', 'error'); return }
      const rowsIn = aoa.slice(1).map(line => ({
        nama: String(iNama >= 0 ? line[iNama] ?? '' : ''),
        url: String(line[iUrl] ?? ''),
        prefix: String(iPrefix >= 0 ? line[iPrefix] ?? '' : ''),
        is_active: String(iStatus >= 0 ? line[iStatus] ?? '' : 'aktif').trim().toLowerCase() === 'nonaktif' ? 'nonaktif' : 'aktif',
        verify_token: String(iTok >= 0 ? line[iTok] ?? '' : ''),
        deskripsi: String(iDesk >= 0 ? line[iDesk] ?? '' : '')
      }))
      const res = await $fetch<{ data: { ditambah: number, dilewati: number } }>(`/api_web/credentials/${id}/webhooks/bulk-import`, { method: 'POST', body: { rows: rowsIn } })
      toast(`Impor selesai: ${res.data.ditambah} ditambah, ${res.data.dilewati} dilewati.`)
      whState.page = 1
      await loadWh()
    } catch (err: any) {
      toast('Gagal mengimpor: ' + (err?.message || 'berkas tidak valid'), 'error')
    }
  }
  reader.readAsArrayBuffer(file)
}

const logFiltered = computed(() => {
  const s = logState.q.trim().toLowerCase()
  return logRows.value.filter((r) => {
    if (logState.hasil && r.hasil !== logState.hasil) return false
    const day = String(r.created_at || '').slice(0, 10)
    if (logState.dari && day < logState.dari) return false
    if (logState.sampai && day > logState.sampai) return false
    if (s && ((r.nama || '') + ' ' + (r.url || '') + ' ' + (r.pesan || '')).toLowerCase().indexOf(s) < 0) return false
    return true
  })
})

const logPages = computed(() => Math.max(1, Math.ceil(logFiltered.value.length / logState.perPage)))
const logFrom = computed(() => logFiltered.value.length === 0 ? 0 : (logState.page - 1) * logState.perPage + 1)
const logTo = computed(() => Math.min(logState.page * logState.perPage, logFiltered.value.length))
const logPageRows = computed(() => {
  const list = logFiltered.value.slice().sort((a, b) => {
    if (a.created_at < b.created_at) return logState.dir === 'asc' ? -1 : 1
    if (a.created_at > b.created_at) return logState.dir === 'asc' ? 1 : -1
    return 0
  })
  if (logState.page > logPages.value) logState.page = logPages.value
  return list.slice((logState.page - 1) * logState.perPage, logState.page * logState.perPage)
})

function applyLogFilter() {
  logState.q = logFilter.q
  logState.hasil = logFilter.hasil
  logState.dari = logFilter.dari
  logState.sampai = logFilter.sampai
  logState.page = 1
}

function resetLogFilter() {
  logFilter.q = ''
  logFilter.hasil = ''
  logFilter.dari = ''
  logFilter.sampai = ''
  logState.q = ''
  logState.hasil = ''
  logState.dari = ''
  logState.sampai = ''
  logState.page = 1
}

const apiFiltered = computed(() => {
  const s = apiState.q.trim().toLowerCase()
  return apiRows.value.filter((r) => {
    if (apiState.hasil && r.hasil !== apiState.hasil) return false
    const day = String(r.created_at || '').slice(0, 10)
    if (apiState.dari && day < apiState.dari) return false
    if (apiState.sampai && day > apiState.sampai) return false
    if (s && ((r.provider || '') + ' ' + (r.method || '') + ' ' + (r.url || '') + ' ' + (r.pesan || '')).toLowerCase().indexOf(s) < 0) return false
    return true
  })
})

function hasilOk(h: string) {
  return ['berhasil', 'ok', 'terkirim', 'sukses', 'success'].indexOf(String(h || '').toLowerCase()) >= 0
}
const apiPages = computed(() => Math.max(1, Math.ceil(apiFiltered.value.length / apiState.perPage)))
const apiFrom = computed(() => apiFiltered.value.length === 0 ? 0 : (apiState.page - 1) * apiState.perPage + 1)
const apiTo = computed(() => Math.min(apiState.page * apiState.perPage, apiFiltered.value.length))
const apiPlFiltered = computed(() => {
  const s = apiPlState.q.trim().toLowerCase()
  return apiPlRows.value.filter((r) => {
    if (apiPlState.hasil === 'berhasil' && !hasilOk(r.hasil)) return false
    else if (apiPlState.hasil && apiPlState.hasil !== 'berhasil' && r.hasil !== apiPlState.hasil) return false
    const day = String(r.created_at || '').slice(0, 10)
    if (apiPlState.dari && day < apiPlState.dari) return false
    if (apiPlState.sampai && day > apiPlState.sampai) return false
    if (s && ((r.provider || '') + ' ' + (r.method || '') + ' ' + (r.url || '') + ' ' + (r.pesan || '')).toLowerCase().indexOf(s) < 0) return false
    return true
  })
})

const apiPlPages = computed(() => Math.max(1, Math.ceil(apiPlFiltered.value.length / apiPlState.perPage)))
const apiPlFrom = computed(() => apiPlFiltered.value.length === 0 ? 0 : (apiPlState.page - 1) * apiPlState.perPage + 1)
const apiPlTo = computed(() => Math.min(apiPlState.page * apiPlState.perPage, apiPlFiltered.value.length))
const apiPlPageRows = computed(() => {
  const list = apiPlFiltered.value.slice().sort((a, b) => {
    if (a.created_at < b.created_at) return apiPlState.dir === 'asc' ? -1 : 1
    if (a.created_at > b.created_at) return apiPlState.dir === 'asc' ? 1 : -1
    return 0
  })
  if (apiPlState.page > apiPlPages.value) apiPlState.page = apiPlPages.value
  return list.slice((apiPlState.page - 1) * apiPlState.perPage, apiPlState.page * apiPlState.perPage)
})
const apiPageRows = computed(() => {
  const list = apiFiltered.value.slice().sort((a, b) => {
    if (a.created_at < b.created_at) return apiState.dir === 'asc' ? -1 : 1
    if (a.created_at > b.created_at) return apiState.dir === 'asc' ? 1 : -1
    return 0
  })
  if (apiState.page > apiPages.value) apiState.page = apiPages.value
  return list.slice((apiState.page - 1) * apiState.perPage, apiState.page * apiState.perPage)
})

function applyApiFilter() {
  apiState.q = apiFilter.q
  apiState.hasil = apiFilter.hasil
  apiState.dari = apiFilter.dari
  apiState.sampai = apiFilter.sampai
  apiState.page = 1
}

function resetApiFilter() {
  apiFilter.q = ''
  apiFilter.hasil = ''
  apiFilter.dari = ''
  apiFilter.sampai = ''
  apiState.q = ''
  apiState.hasil = ''
  apiState.dari = ''
  apiState.sampai = ''
  apiState.page = 1
}

function applyApiPlFilter() {
  apiPlState.q = apiPlFilter.q
  apiPlState.hasil = apiPlFilter.hasil
  apiPlState.dari = apiPlFilter.dari
  apiPlState.sampai = apiPlFilter.sampai
  apiPlState.page = 1
}

function resetApiPlFilter() {
  apiPlFilter.q = ''
  apiPlFilter.hasil = ''
  apiPlFilter.dari = ''
  apiPlFilter.sampai = ''
  apiPlState.q = ''
  apiPlState.hasil = ''
  apiPlState.dari = ''
  apiPlState.sampai = ''
  apiPlState.page = 1
}

async function exportApiLogs() {
  const data = apiPageRows.value.map(r => ({
    Waktu: fmtDate(r.created_at), Provider: r.provider || '', Method: r.method || '', URL: r.url || '',
    Hasil: r.hasil || '', HTTP: r.http == null ? '' : r.http, Durasi: r.durasi_ms == null ? '' : r.durasi_ms, Pesan: r.pesan || ''
  }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Waktu: '', Provider: '', Method: '', URL: '', Hasil: '', HTTP: '', Durasi: '', Pesan: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Log API')
  XLSX.writeFile(wb, `log-api-${whStamp()}.xlsx`)
  toast(`Diekspor ${data.length} log API ke Excel.`)
}

async function exportLogs() {
  const data = logPageRows.value.map(r => ({
    Waktu: fmtDate(r.created_at), Webhook: r.nama || '', URL: r.url || '', Event: r.event || '',
    Hasil: r.hasil || '', HTTP: r.http == null ? '' : r.http, Pesan: r.pesan || ''
  }))
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ Waktu: '', Webhook: '', URL: '', Event: '', Hasil: '', HTTP: '', Pesan: '' }])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Log Webhook')
  XLSX.writeFile(wb, `log-webhook-${whStamp()}.xlsx`)
  toast(`Diekspor ${data.length} log ke Excel.`)
}

await load()
await loadApiLogs()
await loadProviderLogs()
await loadWh()
await loadLogs()
</script>
