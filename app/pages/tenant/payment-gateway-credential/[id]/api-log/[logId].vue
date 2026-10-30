<template>
  <div data-testid="page-api-detail" :data-id="logId" :data-cred="id">
    <nav data-testid="api-detail-breadcrumb" aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700">Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li><NuxtLink to="/tenant/payment-gateway-credential" class="hover:text-emerald-700">Kredensial Gateway</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li><NuxtLink :to="`/tenant/payment-gateway-credential/${id}`" class="hover:text-emerald-700">Detail</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Log API</li>
      </ol>
    </nav>

    <h1 data-testid="api-detail-title" class="text-3xl font-bold text-slate-900 dark:text-white">Detail Log API</h1>

    <div v-if="missing" data-testid="api-detail-missing" class="mt-8 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <i class="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>Log API tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.
    </div>

    <template v-else-if="row">
      <section data-testid="api-detail-card" class="mt-8 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Data umum panggilan API">
        <div class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <i class="fa-solid fa-satellite-dish text-emerald-700" aria-hidden="true"></i>
          <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.provider || 'API' }} • {{ row.method || '-' }}</span>
        </div>
        <div class="p-5">
          <dl data-testid="api-detail-list" class="space-y-2 text-sm">
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">ID</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.id }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Provider</dt><dd class="font-medium text-slate-900 dark:text-white">{{ row.provider || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Method</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.method || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">URL</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.url || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Hasil</dt><dd><UiBadge :text="hasilText" :tone="hasilTone" /></dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">HTTP</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.http == null ? '-' : row.http }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Durasi</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.durasi_ms == null ? '-' : row.durasi_ms + ' ms' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Waktu</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(row.created_at) }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Pesan</dt><dd class="text-slate-700 dark:text-slate-300">{{ row.pesan || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">IP</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.ip || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">User Agent</dt><dd class="break-all text-xs text-slate-700 dark:text-slate-300">{{ row.user_agent || '-' }}</dd></div>
          </dl>
        </div>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Ringkasan request">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-emerald-700" aria-hidden="true"></i>Request
        </h2>
        <pre data-testid="api-detail-request" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.request_ringkas || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Ringkasan response">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-down-to-line mr-2 text-emerald-700" aria-hidden="true"></i>Response
        </h2>
        <pre data-testid="api-detail-response" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.response_ringkas || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Request headers">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-emerald-700" aria-hidden="true"></i>Request Headers
        </h2>
        <pre data-testid="api-detail-req-headers" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.request_header || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Request body">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-emerald-700" aria-hidden="true"></i>Request Body
        </h2>
        <pre data-testid="api-detail-req-body" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.request_body || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Response headers">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-down-to-line mr-2 text-emerald-700" aria-hidden="true"></i>Response Headers
        </h2>
        <pre data-testid="api-detail-resp-headers" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.response_header || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Response body">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-down-to-line mr-2 text-emerald-700" aria-hidden="true"></i>Response Body
        </h2>
        <pre data-testid="api-detail-resp-body" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.response_body || '-' }}</pre>
      </section>

      <div class="mt-6 flex justify-end">
        <NuxtLink :to="`/tenant/payment-gateway-credential/${id}`" data-testid="api-detail-back" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Kembali ke detail kredensial</NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

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
  ip: string
  user_agent: string
  request_ringkas: string
  response_ringkas: string
  request_header: string
  request_body: string
  response_header: string
  response_body: string
  created_at: string
}

const route = useRoute()
const id = route.params.id as string
const logId = route.params.logId as string
const row = ref<ApiLog | null>(null)
const missing = ref(false)

function fmtDate(iso: string | undefined) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso || '-' }
}

const hasilText = computed(() => {
  const s = String(row.value?.hasil || '')
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '-'
})

const hasilTone = computed<'emerald' | 'red'>(() => {
  return ['berhasil', 'terkirim', 'sukses', 'ok'].indexOf(String(row.value?.hasil || '').toLowerCase()) >= 0 ? 'emerald' : 'red'
})

async function load() {
  try {
    const res = await $fetch<{ data: ApiLog }>(`/api_web/credentials/${id}/api-logs/${logId}`)
    row.value = res.data
    return
  } catch { /* coba daftar lalu cari per ID */ }
  try {
    const res = await $fetch<{ data: ApiLog[] }>(`/api_web/credentials/${id}/api-logs?limit=100`)
    const found = (res.data || []).find(r => r.id === logId)
    if (found) row.value = found
    else missing.value = true
  } catch {
    missing.value = true
  }
}

await load()
</script>
