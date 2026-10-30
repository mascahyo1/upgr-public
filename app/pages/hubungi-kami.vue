<template>
  <div class="max-w-3xl">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Hubungi Kami</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Hubungi Kami</h1>
    <p class="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">Untuk integrasi tenant baru atau kendala pengiriman webhook, hubungi tim UPGR melalui kanal berikut.</p>
    <div class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      <div class="flex items-center gap-4 px-5 py-4">
        <i class="fa-solid fa-globe w-4 text-center text-emerald-700" aria-hidden="true"></i>
        <div><p class="font-semibold text-slate-900 dark:text-white">Produksi (rencana)</p><p class="font-mono text-sm text-slate-600 dark:text-slate-400">upgr.example.com</p></div>
      </div>
      <div class="flex items-center gap-4 px-5 py-4">
        <i class="fa-solid fa-flask w-4 text-center text-emerald-700" aria-hidden="true"></i>
        <div><p class="font-semibold text-slate-900 dark:text-white">Development (rencana)</p><p class="font-mono text-sm text-slate-600 dark:text-slate-400">dev-upgr.example.com</p></div>
      </div>
      <div class="flex items-center gap-4 px-5 py-4">
        <i class="fa-solid fa-envelope w-4 text-center text-emerald-700" aria-hidden="true"></i>
        <div><p class="font-semibold text-slate-900 dark:text-white">Email</p><p class="text-sm text-slate-600 dark:text-slate-400">Menyusul saat rilis publik.</p></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Hubungi Kami - UPGR' })
</script>
