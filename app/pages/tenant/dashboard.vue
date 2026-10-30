<template>
  <div data-testid="page-tenant-dashboard" class="max-w-5xl">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Dashboard</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Ringkasan pembayaran dan webhook tenant kamu.</p>
    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-qrcode text-lg" aria-hidden="true"></i></p>
        <p class="mt-3 text-2xl font-bold text-slate-400 dark:text-slate-500">-</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">QRIS dibuat</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-check-double text-lg" aria-hidden="true"></i></p>
        <p class="mt-3 text-2xl font-bold text-slate-400 dark:text-slate-500">-</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Diteruskan ke webhook</p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <p class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-rotate-right text-lg" aria-hidden="true"></i></p>
        <p class="mt-3 text-2xl font-bold text-slate-400 dark:text-slate-500">-</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Antre ulang</p>
      </div>
    </div>
    <p data-testid="tenant-dashboard-note" class="mt-6 text-sm text-slate-500 dark:text-slate-400">Widget akan terisi setelah integrasi pembayaran aktif.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard Tenant - UPGR' })
</script>
