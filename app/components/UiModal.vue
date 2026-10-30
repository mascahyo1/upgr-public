<template>
  <div
    :data-testid="`${p}-modal-backdrop`"
    class="fixed inset-0 z-40 bg-slate-900/50"
    @click="emit('backdrop')"
  ></div>
  <div
    :data-testid="`${p}-modal`"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="`${p}-modal-title`"
    class="fixed inset-0 z-50 overflow-y-auto p-4"
    @click.self="emit('backdrop')"
  >
    <div
      :class="['m-auto flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900', maxW]"
    >
      <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 :id="`${p}-modal-title`" :data-testid="`${p}-modal-title`" class="text-xl font-bold text-slate-900 dark:text-white">
          {{ title }}
        </h2>
        <button
          type="button"
          :data-testid="`${p}-x`"
          :aria-label="closeLabel"
          title="Tutup"
          class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          @click="emit('close')"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  p: string
  title: string
  maxW?: string
  closeLabel?: string
}>(), {
  maxW: 'max-w-lg',
  closeLabel: 'Tutup'
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'backdrop'): void
}>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>
