<template>
  <div>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Beranda Tenant</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Selamat datang di portal tenant UPGR.</p>
    <div class="mt-8 grid gap-4">
      <NuxtLink to="/tenant/payment-gateway-credential" class="rounded-lg border border-slate-200 p-5 hover:border-emerald-600 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800">
        <p class="font-semibold text-slate-900 dark:text-white"><i class="fa-solid fa-key mr-2 text-emerald-700" aria-hidden="true"></i>Kredensial Gateway</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Kelola kunci gateway milik tenant.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
