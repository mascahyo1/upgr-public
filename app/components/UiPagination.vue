<template>
  <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
    <p :data-testid="`${p}-pageinfo`">{{ from }} - {{ to }} / {{ total }}</p>
    <div class="flex items-center gap-1">
      <button
        type="button"
        :data-testid="`${p}-prev`"
        title="Halaman sebelumnya"
        :aria-label="`${label} sebelumnya`"
        :disabled="page <= 1"
        class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        @click="emit('prev')"
      >
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </button>
      <span :data-testid="`${p}-page`" class="px-2">{{ page }} / {{ pages }}</span>
      <button
        type="button"
        :data-testid="`${p}-next`"
        title="Halaman berikutnya"
        :aria-label="`${label} berikutnya`"
        :disabled="page >= pages"
        class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        @click="emit('next')"
      >
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  p: string
  label?: string
  page: number
  pages: number
  from: number
  to: number
  total: number
}>(), {
  label: 'Halaman'
})

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>
