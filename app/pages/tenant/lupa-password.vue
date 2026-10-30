<template>
  <div class="mx-auto max-w-md rounded-xl border border-slate-200 p-8 dark:border-slate-800 dark:bg-slate-950">
    <p class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-700 text-white">
      <i class="fa-solid fa-key text-xl" aria-hidden="true"></i>
    </p>
    <h1 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Lupa kata sandi tenant</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Reset otomatis belum tersedia di MVP lokal. Hubungi admin UPGR untuk reset manual sambil menunggu fitur ini.</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <NuxtLink to="/tenant/login" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">Kembali ke Login Tenant</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Lupa Kata Sandi Tenant - UPGR' })
</script>
