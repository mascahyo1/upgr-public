<template>
  <div>
    <div ref="box" data-testid="login-captcha"></div>
    <input type="hidden" data-testid="login-captcha-token" :value="token" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ sitekey: string }>()

const token = defineModel<string>({ default: '' })

const box = ref<HTMLElement | null>(null)
let widgetId: string | null = null

function render() {
  const w = (window as any).turnstile
  if (!w || !box.value) return
  try { if (widgetId !== null) w.remove(widgetId) } catch {}
  widgetId = w.render(box.value, {
    sitekey: props.sitekey,
    callback: (t: string) => { token.value = t || '' },
    'expired-callback': () => { token.value = '' },
    'error-callback': () => { token.value = '' }
  })
}

function reset() {
  try { (window as any).turnstile?.reset(widgetId) } catch {}
  token.value = ''
}

onMounted(() => {
  if (document.querySelector('script[data-turnstile]')) { render(); return }
  const s = document.createElement('script')
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  s.async = true
  s.defer = true
  s.setAttribute('data-turnstile', '')
  s.onload = render
  document.head.appendChild(s)
})

defineExpose({ reset })
</script>
