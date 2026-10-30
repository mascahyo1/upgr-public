<template>
  <div data-testid="page-tenant-profil">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/tenant/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Profil</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Profil Tenant</h1>
    <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">Identitas akun login dan ganti kata sandi.</p>
    <div data-testid="profil-errors" role="alert" :class="['mt-6 rounded-md border px-4 py-3 text-sm', Object.keys(errs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
      <template v-if="Object.keys(errs).length">
        <p class="font-semibold">Periksa kembali isian berikut:</p>
        <ul class="mt-1 list-disc pl-5">
          <li v-for="(msg, k) in errs" :key="k">{{ msg }}</li>
        </ul>
      </template>
    </div>
    <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Identitas tenant">
      <div class="flex items-center gap-2 border-b border-slate-200 px-6 py-3 dark:border-slate-800">
        <i class="fa-solid fa-id-card text-emerald-700" aria-hidden="true"></i>
        <span class="text-sm font-semibold text-slate-900 dark:text-white">Identitas Tenant</span>
      </div>
      <form data-testid="profil-form" novalidate @submit.prevent="submit">
        <div class="space-y-4 p-6">
      <div>
        <label for="profil-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama tenant <span class="text-red-500">*</span></label>
        <input id="profil-nama" v-model="form.nama" data-testid="profil-nama" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': errs.nama }" />
        <p data-testid="profil-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', errs.nama ? '' : 'hidden']">{{ errs.nama }}</p>
      </div>
      <div>
        <label for="profil-email" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Email <span class="text-red-500">*</span></label>
        <input id="profil-email" v-model="form.email" data-testid="profil-email" type="email" placeholder="tenant@contoh.id" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': errs.email }" />
        <p data-testid="profil-email-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', errs.email ? '' : 'hidden']">{{ errs.email }}</p>
      </div>
      <div>
        <label for="profil-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
        <textarea id="profil-deskripsi" v-model="form.deskripsi" data-testid="profil-deskripsi" rows="2" maxlength="500" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950"></textarea>
        <p data-testid="profil-deskripsi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', errs.deskripsi ? '' : 'hidden']">{{ errs.deskripsi }}</p>
      </div>
        </div>
        <div class="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
        <button type="submit" data-testid="profil-submit" class="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Simpan</button>
      </div>
      </form>
    </section>
    <div data-testid="profil-pass-errors" role="alert" :class="['mt-6 rounded-md border px-4 py-3 text-sm', Object.keys(pwErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
      <template v-if="Object.keys(pwErrs).length">
        <p class="font-semibold">Periksa kembali isian berikut:</p>
        <ul class="mt-1 list-disc pl-5">
          <li v-for="(msg, k) in pwErrs" :key="k">{{ msg }}</li>
        </ul>
      </template>
    </div>
    <section class="mt-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" aria-label="Ganti kata sandi">
      <div class="flex items-center gap-2 border-b border-slate-200 px-6 py-3 dark:border-slate-800">
        <i class="fa-solid fa-key text-emerald-700" aria-hidden="true"></i>
        <span class="text-sm font-semibold text-slate-900 dark:text-white">Ganti Kata Sandi</span>
      </div>
      <form data-testid="profil-pass-form" novalidate @submit.prevent="submitPw">
        <div class="space-y-4 p-6">
          <div>
            <label for="profil-pass-lama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Kata sandi lama <span class="text-red-500">*</span></label>
            <input id="profil-pass-lama" v-model="pw.lama" data-testid="profil-pass-lama" type="password" autocomplete="current-password" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': pwErrs.password_lama }" />
            <p data-testid="profil-pass-lama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', pwErrs.password_lama ? '' : 'hidden']">{{ pwErrs.password_lama }}</p>
          </div>
          <div>
            <label for="profil-pass-baru" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Kata sandi baru <span class="text-red-500">*</span></label>
            <input id="profil-pass-baru" v-model="pw.baru" data-testid="profil-pass-baru" type="password" autocomplete="new-password" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': pwErrs.password_baru }" />
            <p data-testid="profil-pass-baru-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', pwErrs.password_baru ? '' : 'hidden']">{{ pwErrs.password_baru }}</p>
          </div>
          <div>
            <label for="profil-pass-konfirmasi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Konfirmasi kata sandi baru <span class="text-red-500">*</span></label>
            <input id="profil-pass-konfirmasi" v-model="pw.konfirmasi" data-testid="profil-pass-konfirmasi" type="password" autocomplete="new-password" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': pwErrs.konfirmasi }" />
            <p data-testid="profil-pass-konfirmasi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', pwErrs.konfirmasi ? '' : 'hidden']">{{ pwErrs.konfirmasi }}</p>
          </div>
        </div>
        <div class="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button type="submit" data-testid="profil-pass-submit" class="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Ganti Kata Sandi</button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Profil Tenant - UPGR' })

const { toast } = useToast()

const errs = reactive<Record<string, string>>({})

const form = reactive({ nama: '', email: '', deskripsi: '' })

async function load() {
  try {
    const res = await $fetch<{ data: typeof form }>('/api_web/tenant/profil')
    form.nama = res.data.nama
    form.email = res.data.email
    form.deskripsi = res.data.deskripsi
  } catch (err: any) {
    const st = err?.response?.status ?? err?.statusCode
    if (st === 401) {
      if (import.meta.client) await navigateTo('/tenant/login')
      return
    }
    if (import.meta.client) toast('Gagal memuat profil: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
  }
}

function validateLocal() {
  const e: Record<string, string> = {}
  if (!form.nama.trim()) e.nama = 'Nama tenant wajib diisi.'
  else if (form.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (!form.email.trim()) e.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email tidak valid.'
  else if (form.email.trim().length > 100) e.email = 'Email maksimal 100 karakter.'
  if (form.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  return e
}

async function submit() {
  const e = validateLocal()
  for (const k of Object.keys(errs)) delete errs[k]
  Object.assign(errs, e)
  if (Object.keys(e).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  try {
    await $fetch('/api_web/tenant/profil', {
      method: 'PUT',
      body: { nama: form.nama.trim(), email: form.email.trim(), deskripsi: form.deskripsi.trim() }
    })
    toast('Profil tenant tersimpan.')
  } catch (err: any) {
    const serverErrs = err?.data?.data?.errors
    if (serverErrs) {
      Object.assign(errs, serverErrs)
      toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    } else {
      toast('Gagal menyimpan: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
  }
}

const pw = reactive({ lama: '', baru: '', konfirmasi: '' })
const pwErrs = reactive<Record<string, string>>({})

function validatePw() {
  const e: Record<string, string> = {}
  if (!pw.lama) e.password_lama = 'Kata sandi lama wajib diisi.'
  if (pw.baru.length < 8) e.password_baru = 'Kata sandi baru minimal 8 karakter.'
  else if (pw.baru.length > 100) e.password_baru = 'Kata sandi baru maksimal 100 karakter.'
  if (pw.konfirmasi !== pw.baru) e.konfirmasi = 'Konfirmasi tidak sama dengan kata sandi baru.'
  return e
}

async function submitPw() {
  const e = validatePw()
  for (const k of Object.keys(pwErrs)) delete pwErrs[k]
  Object.assign(pwErrs, e)
  if (Object.keys(e).length > 0) {
    toast('Gagal mengganti kata sandi. Periksa kembali isian.', 'error')
    return
  }
  try {
    await $fetch('/api_web/tenant/password', { method: 'PUT', body: { password_lama: pw.lama, password_baru: pw.baru, konfirmasi: pw.konfirmasi } })
    toast('Kata sandi berhasil diganti.')
    pw.lama = ''; pw.baru = ''; pw.konfirmasi = ''
  } catch (err: any) {
    const serverErrs = err?.data?.data?.errors
    if (serverErrs) {
      Object.assign(pwErrs, serverErrs)
      toast('Gagal mengganti kata sandi. Periksa kembali isian.', 'error')
    } else {
      toast('Gagal mengganti kata sandi: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
  }
}

await load()
</script>
