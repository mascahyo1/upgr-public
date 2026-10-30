<template>
  <div data-testid="page-sim-detail" :data-id="simId">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700">Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li><NuxtLink to="/tenant/simulator-webhook" class="hover:text-emerald-700">Simulator Webhook</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Detail</li>
      </ol>
    </nav>

    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Detail Tangkapan</h1>

    <div v-if="missing" data-testid="sim-detail-missing" class="mt-8 rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <i class="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>Tangkapan tidak ditemukan. Mungkin sudah dihapus atau ID tidak valid.
    </div>

    <template v-else-if="row">
      <section data-testid="sim-detail-card" class="mt-8 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Data umum tangkapan">
        <div class="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <i class="fa-solid fa-inbox text-emerald-700" aria-hidden="true"></i>
          <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ row.method || 'POST' }} • {{ fmtDate(row.created_at) }}</span>
        </div>
        <div class="p-5">
          <dl class="space-y-2 text-sm">
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">ID</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.id }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Method</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.method || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">URL</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.url || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Waktu</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(row.created_at) }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">IP</dt><dd class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.ip || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">User Agent</dt><dd class="break-all text-xs text-slate-700 dark:text-slate-300">{{ row.user_agent || '-' }}</dd></div>
            <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Respons</dt><dd><UiBadge :text="String(row.response_status ?? 0)" :tone="row.response_status === 201 ? 'emerald' : 'red'" /></dd></div>
          </dl>
        </div>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Request headers">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-emerald-700" aria-hidden="true"></i>Request Headers
        </h2>
        <pre data-testid="sim-detail-req-headers" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.request_header || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Request body">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-up-right-from-square mr-2 text-emerald-700" aria-hidden="true"></i>Request Body
        </h2>
        <pre data-testid="sim-detail-req-body" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.request_body || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Response headers">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-down-to-line mr-2 text-emerald-700" aria-hidden="true"></i>Response Headers
        </h2>
        <pre data-testid="sim-detail-resp-headers" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.response_header || '-' }}</pre>
      </section>

      <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Response body">
        <h2 class="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
          <i class="fa-solid fa-arrow-down-to-line mr-2 text-emerald-700" aria-hidden="true"></i>Response Body
        </h2>
        <pre data-testid="sim-detail-resp-body" class="overflow-x-auto whitespace-pre-wrap break-all p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.response_body || '-' }}</pre>
      </section>

      <div class="mt-6 flex justify-end">
        <NuxtLink to="/tenant/simulator-webhook" data-testid="sim-detail-back" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Kembali ke simulator</NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

interface SimDetail {
  id: string
  tenant_id: string
  ip: string
  user_agent: string
  method: string
  url: string
  request_header: string
  request_body: string
  response_status: number
  response_header: string
  response_body: string
  created_at: string
}

const route = useRoute()
const { toast } = useToast()
const simId = route.params.id as string
const row = ref<SimDetail | null>(null)
const missing = ref(false)

function fmtDate(iso: string | undefined) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch { return iso || '-' }
}

onMounted(async () => {
  try {
    const milik = await $fetch<{ data: { tenant_id: string } }>('/api_external/publik/simulator/milik')
    const res = await $fetch<{ data: SimDetail }>(`/api_external/publik/simulator/terima/${milik.data.tenant_id}/${simId}`)
    row.value = res.data
  } catch {
    missing.value = true
    toast('Tangkapan tidak ditemukan.', 'error')
  }
})
</script>
