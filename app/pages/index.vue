<template>
  <div>
    <div class="grid gap-10 md:grid-cols-5 md:items-center">
      <div class="md:col-span-3">
        <h1 class="text-4xl font-bold leading-tight text-slate-900 dark:text-white">Satu webhook gateway, diteruskan ke banyak tenant.</h1>
        <p class="mt-4 max-w-xl leading-relaxed text-slate-600 dark:text-slate-400">UPGR menerima satu notifikasi pembayaran dari gateway, memverifikasinya, lalu meneruskannya ke webhook tiap tenant melalui antrian dengan retry dan idempotency key.</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#cara-kerja" class="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Lihat cara kerja</a>
          <NuxtLink to="/hubungi-kami" class="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Hubungi kami</NuxtLink>
        </div>
        <p class="mt-4 text-sm text-slate-500 dark:text-slate-400"><i class="fa-solid fa-qrcode mr-1.5 text-emerald-700" aria-hidden="true"></i>MVP: QRIS dinamis Midtrans - 1 akun provider, 1 tenant.</p>
      </div>
      <div class="md:col-span-2">
        <div class="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <p class="border-b border-slate-700 px-4 py-2 font-mono text-xs text-slate-400">POST https://tenant.contoh/hook &middot; contoh</p>
          <pre class="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-slate-200">X-Event-Id: evt_midtrans_9f27c1
X-Idempotency-Key: upgr-9f27c1-01
X-Upgr-Signature: hmac_sha256=...

{
  "order_id": "ERP-2026-000123",
  "transaction_status": "settlement",
  "gross_amount": "50000"
}</pre>
        </div>
      </div>
    </div>
    <hr class="my-12 border-slate-200 dark:border-slate-800" />
    <h2 id="cara-kerja" class="text-2xl font-bold text-slate-900 dark:text-white">Cara kerja</h2>
    <ol class="mt-6 grid gap-8 md:grid-cols-3">
      <li>
        <p class="font-mono text-sm font-bold text-emerald-700">01</p>
        <p class="mt-2 font-semibold text-slate-900 dark:text-white">Terima &amp; verifikasi</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Satu endpoint publik per gateway. Signature dicek dengan server key provider sebelum event disimpan.</p>
      </li>
      <li>
        <p class="font-mono text-sm font-bold text-emerald-700">02</p>
        <p class="mt-2 font-semibold text-slate-900 dark:text-white">Petakan ke tenant</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Tenant dikenali dari mapping <span class="font-mono text-[13px]">order_id</span>, tanpa menebak dari payload.</p>
      </li>
      <li>
        <p class="font-mono text-sm font-bold text-emerald-700">03</p>
        <p class="mt-2 font-semibold text-slate-900 dark:text-white">Antrikan &amp; teruskan</p>
        <p class="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Satu job per tujuan. Gagal kirim diulang dengan backoff, yang macet masuk dead-letter queue.</p>
      </li>
    </ol>
    <hr class="my-12 border-slate-200 dark:border-slate-800" />
    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Ruang lingkup MVP</h2>
    <dl class="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
      <div><dt class="font-semibold text-slate-900 dark:text-white">Gateway</dt><dd class="mt-1 text-slate-600 dark:text-slate-400">Midtrans saja (DOKU menyusul).</dd></div>
      <div><dt class="font-semibold text-slate-900 dark:text-white">Channel</dt><dd class="mt-1 text-slate-600 dark:text-slate-400">QRIS dinamis saja.</dd></div>
      <div><dt class="font-semibold text-slate-900 dark:text-white">Akun</dt><dd class="mt-1 text-slate-600 dark:text-slate-400">1 akun provider, 1 tenant. Tenant tanpa pegang server key.</dd></div>
      <div><dt class="font-semibold text-slate-900 dark:text-white">Kunci</dt><dd class="mt-1 text-slate-600 dark:text-slate-400">Managed key terpusat. BYOK di luar MVP.</dd></div>
    </dl>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Beranda - UPGR' })
</script>
