<template>
  <span :class="['inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone]]">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text?: string
  tone?: 'emerald' | 'slate' | 'red' | 'amber'
}>(), {
  text: '',
  tone: 'slate'
})

const tones: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  slate: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
}
</script>
