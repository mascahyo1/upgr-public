<template>
  <div data-testid="page-provider-home">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Provider</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Beranda Provider</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Selamat datang di portal provider UPGR.</p>
    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <NuxtLink to="/provider/tenant" class="rounded-lg border border-slate-200 bg-white p-5 hover:border-emerald-700 dark:border-slate-800 dark:bg-slate-900">
        <p class="font-semibold text-slate-900 dark:text-white"><i class="fa-solid fa-users mr-2 text-emerald-700" aria-hidden="true"></i>Tenant</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Kelola tenant dan kredensial masuknya.</p>
      </NuxtLink>
      <NuxtLink to="/provider/konfigurasi" class="rounded-lg border border-slate-200 bg-white p-5 hover:border-emerald-700 dark:border-slate-800 dark:bg-slate-900">
        <p class="font-semibold text-slate-900 dark:text-white"><i class="fa-solid fa-gear mr-2 text-emerald-700" aria-hidden="true"></i>Konfigurasi</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Kunci gateway dan perilaku router.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'provider' })
useHead({ title: 'Beranda Provider - UPGR' })
</script>
