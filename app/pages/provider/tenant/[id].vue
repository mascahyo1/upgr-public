<template>
  <div data-testid="page-tenant-detail" :data-id="id">
    <nav aria-label="Breadcrumb" class="mb-4 text-sm text-slate-500 dark:text-slate-400">
      <ol class="flex flex-wrap items-center gap-2">
        <li><NuxtLink to="/provider/beranda" class="hover:text-emerald-700"><i class="fa-solid fa-house mr-1" aria-hidden="true"></i>Beranda Provider</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li><NuxtLink to="/provider/tenant" class="hover:text-emerald-700">Tenant</NuxtLink></li>
        <li aria-hidden="true" class="text-slate-300">/</li>
        <li aria-current="page" class="font-medium text-slate-900 dark:text-white">Detail</li>
      </ol>
    </nav>
    <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Detail Tenant</h1>

    <div v-if="missing" class="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <i class="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true"></i>Tenant tidak ditemukan. Mungkin sudah dihapus.
      <div class="mt-4"><NuxtLink to="/provider/tenant" class="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">Kembali ke daftar</NuxtLink></div>
    </div>

    <div v-else-if="row" data-testid="tenant-detail-card" class="mt-8 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <dl data-testid="tenant-detail-list" class="space-y-2 text-sm">
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Nama</dt><dd class="font-medium text-slate-900 dark:text-white">{{ row.nama }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Email</dt><dd class="break-all font-mono text-xs text-slate-700 dark:text-slate-300">{{ row.email }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Deskripsi</dt><dd class="text-slate-700 dark:text-slate-300">{{ row.deskripsi || '-' }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Status</dt><dd><UiBadge :text="row.status === 'aktif' ? 'Aktif' : 'Nonaktif'" :tone="row.status === 'aktif' ? 'emerald' : 'slate'" /></dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Dibuat</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(row.created_at) }} oleh {{ row.created_by }}</dd></div>
        <div class="flex gap-2"><dt class="w-28 shrink-0 text-slate-500 dark:text-slate-400">Diubah</dt><dd class="text-slate-700 dark:text-slate-300">{{ fmtDate(row.updated_at) }}</dd></div>
      </dl>
      <div class="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <NuxtLink to="/provider/tenant" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Kembali</NuxtLink>
        <button type="button" data-testid="tenant-detail-edit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="openEdit">Ubah</button>
      </div>
    </div>
  </div>

  <UiModal v-if="editOpen" p="tenant-detail" title="Ubah Tenant" max-w="max-w-lg" @close="editOpen = false" @backdrop="editOpen = false">
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
      <div data-testid="tenant-detail-form-errors" role="alert" :class="['rounded-md border px-4 py-3 text-sm', Object.keys(formErrs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(formErrs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in formErrs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="tenant-detail-form" novalidate @submit.prevent="submitEdit">
        <div class="space-y-4">
          <div>
            <label for="tenant-detail-nama" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Nama <span class="text-red-500">*</span></label>
            <input id="tenant-detail-nama" v-model="form.nama" data-testid="tenant-detail-nama" type="text" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.nama }" />
            <p data-testid="tenant-detail-nama-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.nama ? '' : 'hidden']">{{ formErrs.nama }}</p>
          </div>
          <div>
            <label for="tenant-detail-email" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Email <span class="text-red-500">*</span></label>
            <input id="tenant-detail-email" v-model="form.email" data-testid="tenant-detail-email" type="email" maxlength="100" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.email }" />
            <p data-testid="tenant-detail-email-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.email ? '' : 'hidden']">{{ formErrs.email }}</p>
          </div>
          <div>
            <label for="tenant-detail-password" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Kata sandi baru (opsional)</label>
            <input id="tenant-detail-password" v-model="form.password" data-testid="tenant-detail-password" type="password" autocomplete="new-password" placeholder="Kosongkan bila tidak diubah" class="w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': formErrs.password }" />
            <p data-testid="tenant-detail-password-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.password ? '' : 'hidden']">{{ formErrs.password }}</p>
          </div>
          <div>
            <label for="tenant-detail-deskripsi" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Deskripsi</label>
            <input id="tenant-detail-deskripsi" v-model="form.deskripsi" data-testid="tenant-detail-deskripsi" type="text" maxlength="500" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" />
            <p data-testid="tenant-detail-deskripsi-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.deskripsi ? '' : 'hidden']">{{ formErrs.deskripsi }}</p>
          </div>
          <div>
            <label for="tenant-detail-status" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Status <span class="text-red-500">*</span></label>
            <select id="tenant-detail-status" v-model="form.status" data-testid="tenant-detail-status" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <p data-testid="tenant-detail-status-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', formErrs.status ? '' : 'hidden']">{{ formErrs.status }}</p>
          </div>
        </div>
      </form>
    </div>
    <div class="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
      <button type="button" data-testid="tenant-detail-form-cancel" class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="editOpen = false">Batal</button>
      <button type="button" data-testid="tenant-detail-form-submit" class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submitEdit">Simpan</button>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'provider' })
useHead({ title: 'Detail Tenant - UPGR' })

const route = useRoute()
const id = route.params.id as string
const { toast } = useToast()

interface Tenant {
  id: string
  nama: string
  email: string
  deskripsi: string
  status: string
  created_by: string
  created_at: string
  updated_at: string
}

const row = ref<Tenant | null>(null)
const missing = ref(false)
const editOpen = ref(false)
const form = reactive({ nama: '', email: '', password: '', deskripsi: '', status: 'aktif' })
const formErrs = reactive<Record<string, string>>({})

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

async function load() {
  try {
    const res = await $fetch<{ data: Tenant }>(`/api_web/provider/tenants/${id}`)
    row.value = res.data
  } catch {
    missing.value = true
  }
}

function openEdit() {
  if (!row.value) return
  form.nama = row.value.nama
  form.email = row.value.email
  form.password = ''
  form.deskripsi = row.value.deskripsi
  form.status = row.value.status
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  editOpen.value = true
}

function validateLocal() {
  const e: Record<string, string> = {}
  if (!form.nama.trim()) e.nama = 'Nama wajib diisi.'
  else if (form.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter.'
  if (!form.email.trim()) e.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email tidak valid.'
  else if (form.email.trim().length > 100) e.email = 'Email maksimal 100 karakter.'
  if (form.password) {
    if (form.password.length < 8) e.password = 'Kata sandi minimal 8 karakter.'
  }
  if (form.deskripsi.trim().length > 500) e.deskripsi = 'Deskripsi maksimal 500 karakter.'
  if (form.status !== 'aktif' && form.status !== 'nonaktif') e.status = 'Status tidak valid.'
  return e
}

async function submitEdit() {
  const errs = validateLocal()
  for (const k of Object.keys(formErrs)) delete formErrs[k]
  Object.assign(formErrs, errs)
  if (Object.keys(errs).length > 0) {
    toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    return
  }
  try {
    const payload: Record<string, string> = { nama: form.nama.trim(), email: form.email.trim(), deskripsi: form.deskripsi.trim(), status: form.status }
    if (form.password) payload.password = form.password
    await $fetch(`/api_web/provider/tenants/${id}`, { method: 'PUT', body: payload })
    toast('Tenant tersimpan.')
    editOpen.value = false
    await load()
  } catch (err: any) {
    const serverErrs = err?.data?.data?.errors
    if (serverErrs) {
      Object.assign(formErrs, serverErrs)
      toast('Gagal menyimpan. Periksa kembali isian.', 'error')
    } else {
      toast('Gagal menyimpan: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
  }
}

await load()
</script>
