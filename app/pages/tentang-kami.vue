<template>
  <div class="max-w-3xl">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Tentang Kami</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Tentang Kami</h1>
    <p class="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">UPGR lahir dari kebutuhan internal: memakai satu akun payment gateway bersama untuk banyak aplikasi dan banyak tenant. Pengajuan akun gateway per aplikasi itu ribet dan lama, jadi satu akun dipakai rame-rame lewat router ini.</p>
    <hr class="my-8 border-slate-200 dark:border-slate-800" />
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Pemakai</h2>
    <div class="mt-4 space-y-4">
      <div>
        <p class="font-semibold text-slate-900 dark:text-white"><i class="fa-solid fa-network-wired mr-2 text-emerald-700" aria-hidden="true"></i>ERP RT/RW Net</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Pemakai pertama. Tagihan banyak perusahaan diteruskan ke webhook masing-masing via satu akun Midtrans.</p>
      </div>
      <div>
        <p class="font-semibold text-slate-900 dark:text-white"><i class="fa-solid fa-school mr-2 text-emerald-700" aria-hidden="true"></i>BIS (masa depan)</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Persiapan arsitektur saja. Pembayaran BIS tetap lokal dan tidak diubah sekarang.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Tentang Kami - UPGR' })
</script>
