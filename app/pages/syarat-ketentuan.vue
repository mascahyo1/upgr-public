<template>
  <div class="max-w-3xl">
    <nav aria-label="Breadcrumb" class="mb-8 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Syarat &amp; Ketentuan</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Syarat &amp; Ketentuan</h1>
    <ol class="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-slate-600 dark:text-slate-400">
      <li>Layanan UPGR pada tahap MVP disediakan untuk tenant terdaftar (1 provider, 1 tenant).</li>
      <li>Tenant wajib menjaga kerahasiaan API key UPGR miliknya dan endpoint webhook penerima.</li>
      <li>Endpoint webhook tenant wajib idempoten: notifikasi yang sama dapat dikirim lebih dari sekali saat retry.</li>
      <li>Verifikasi signature Midtrans dilakukan di sisi UPGR; penerusan ke tenant ditandatangani ulang dengan secret tenant.</li>
      <li>Ketentuan ini akan dilengkapi sebelum rilis publik.</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Syarat & Ketentuan - UPGR' })
</script>
