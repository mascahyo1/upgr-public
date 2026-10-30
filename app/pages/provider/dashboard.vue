<template>
  <div data-testid="page-provider-dashboard" class="max-w-5xl">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/provider/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Provider</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Dashboard</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Ringkasan penyaluran webhook seluruh tenant.</p>
    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-users text-lg" aria-hidden="true"></i></p>
        <p class="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{{ tenantCount }}</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Tenant terdaftar</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-bolt text-lg" aria-hidden="true"></i></p>
        <p class="mt-3 text-2xl font-bold text-slate-400 dark:text-slate-500">-</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Event hari ini</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-triangle-exclamation text-lg" aria-hidden="true"></i></p>
        <p class="mt-3 text-2xl font-bold text-slate-400 dark:text-slate-500">-</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Gagal perlu perhatian</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'provider' })
useHead({ title: 'Dashboard Provider - UPGR' })

const tenantCount = ref(0)

try {
  const res = await $fetch<{ data: unknown[] }>('/api_web/provider/tenants')
  tenantCount.value = res.data.length
} catch { /* abaikan */ }
</script>
