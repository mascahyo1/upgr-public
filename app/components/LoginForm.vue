<template>
  <div data-testid="page-login" class="mx-auto grid max-w-4xl overflow-hidden rounded-xl border border-slate-200 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-950">
    <div class="bg-emerald-800 p-8 text-white md:p-10">
      <p class="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
        <i class="fa-solid fa-arrows-split-up-and-left text-xl" aria-hidden="true"></i>
      </p>
      <h1 class="mt-6 text-2xl font-bold leading-snug">Login {{ kind }} UPGR</h1>
      <p class="mt-2 text-sm leading-relaxed text-emerald-100">Satu pintu masuk untuk {{ kind === 'Provider' ? 'mengelola gateway dan tenant' : 'memantau pembayaran dan webhook' }}.</p>
      <ul class="mt-6 space-y-3 text-sm text-emerald-100">
        <li><i class="fa-solid fa-check mr-2" aria-hidden="true"></i>Webhook terverifikasi signature</li>
        <li><i class="fa-solid fa-check mr-2" aria-hidden="true"></i>Penerusan via antrian idempoten</li>
        <li><i class="fa-solid fa-check mr-2" aria-hidden="true"></i>Log pengiriman per tenant</li>
      </ul>
    </div>
    <div class="p-8 md:p-10">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Masuk</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Gunakan akun {{ kind.toLowerCase() }} UPGR kamu.</p>
      <div data-testid="login-form-errors" role="alert" :class="['mt-4 rounded-md border px-4 py-3 text-sm', Object.keys(errs).length ? 'border-red-300 bg-red-50 text-red-800' : 'hidden border-red-300 bg-red-50 text-red-800']">
        <template v-if="Object.keys(errs).length">
          <p class="font-semibold">Periksa kembali isian berikut:</p>
          <ul class="mt-1 list-disc pl-5">
            <li v-for="(msg, k) in errs" :key="k">{{ msg }}</li>
          </ul>
        </template>
      </div>
      <form data-testid="login-form" class="mt-6 space-y-4" novalidate @submit.prevent="submit">
        <div>
          <label :for="`login-email`" class="mb-1 block text-sm font-semibold text-slate-900 dark:text-white">Email</label>
          <input id="login-email" v-model="email" data-testid="login-email" type="email" autocomplete="email" placeholder="nama@contoh.id"
                 class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': errs.email }" />
          <p data-testid="login-email-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', errs.email ? '' : 'hidden']">{{ errs.email }}</p>
        </div>
        <div>
          <div class="mb-1 flex items-center justify-between">
            <label for="login-password" class="text-sm font-semibold text-slate-900 dark:text-white">Kata sandi</label>
            <NuxtLink :to="`/${area}/lupa-password`" data-testid="login-forgot" class="text-sm font-medium text-emerald-700 hover:underline">Lupa kata sandi?</NuxtLink>
          </div>
          <input id="login-password" v-model="password" data-testid="login-password" type="password" autocomplete="current-password"
                 class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950" :class="{ 'border-red-500': errs.password }" />
          <p data-testid="login-password-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', errs.password ? '' : 'hidden']">{{ errs.password }}</p>
        </div>
        <div>
          <TurnstileWidget ref="captchaWidget" v-model="captcha" :sitekey="sitekey" />
          <p data-testid="login-captcha-error" :class="['mt-1 text-xs text-red-600 dark:text-red-400', errs.captcha ? '' : 'hidden']">{{ errs.captcha }}</p>
        </div>
        <button type="submit" data-testid="login-submit" :disabled="loading" class="w-full rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {{ loading ? 'Memeriksa…' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ kind: 'Tenant' | 'Provider', area: 'tenant' | 'provider' }>()

const config = useRuntimeConfig()
const sitekey = (config.public as any).turnstileSiteKey || ''
const { toast } = useToast()

const email = ref('')
const password = ref('')
const captcha = ref('')
const captchaWidget = ref<{ reset: () => void } | null>(null)
const loading = ref(false)
const errs = reactive<Record<string, string>>({})

async function submit() {
  const e: Record<string, string> = {}
  if (!email.value.trim()) e.email = 'Email wajib diisi.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) e.email = 'Format email tidak valid.'
  if (!password.value) e.password = 'Kata sandi wajib diisi.'
  if (!captcha.value) e.captcha = 'Centang verifikasi captcha.'
  for (const k of Object.keys(errs)) delete errs[k]
  Object.assign(errs, e)
  if (Object.keys(e).length > 0) {
    toast('Gagal masuk. Periksa kembali isian.', 'error')
    return
  }
  loading.value = true
  try {
    await $fetch('/api_web/auth/login', {
      method: 'POST',
      body: { area: props.area, email: email.value.trim(), password: password.value, captcha: captcha.value }
    })
    toast(`Selamat datang.`)
    await navigateTo(props.area === 'tenant' ? '/tenant/beranda' : '/provider/beranda')
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    const serverErrs = err?.data?.data?.errors
    if (status === 429) {
      toast('Terlalu banyak percobaan. Coba lagi dalam beberapa saat.', 'error')
    } else if (serverErrs) {
      Object.assign(errs, serverErrs)
      toast('Gagal masuk. Periksa kembali isian.', 'error')
    } else if (status === 401) {
      toast('Email atau kata sandi salah.', 'error')
    } else {
      toast('Gagal masuk: ' + (err?.data?.data?.error || err?.message || 'kesalahan jaringan'), 'error')
    }
    captchaWidget.value?.reset()
  } finally {
    loading.value = false
  }
}
</script>
