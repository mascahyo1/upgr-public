<template>
  <div class="max-w-3xl">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Kebijakan Privasi</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Kebijakan Privasi</h1>
    <p class="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">UPGR menyimpan payload notifikasi pembayaran mentah, hasil verifikasi signature, dan log pengiriman ke tenant untuk keperluan rekonsiliasi dan audit.</p>
    <p class="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">Kredensial gateway milik provider disimpan terenkripsi dan tidak dibagikan ke tenant. Data hanya dipakai untuk operasional routing pembayaran.</p>
    <p class="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">Kebijakan ini akan dilengkapi sebelum rilis publik.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Kebijakan Privasi - UPGR' })
</script>
