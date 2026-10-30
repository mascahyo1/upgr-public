<template>
  <div data-testid="admin-toasts" class="fixed bottom-4 right-4 z-[60] w-80 max-w-[90vw] space-y-2" aria-live="polite">
    <div
      v-for="t in toasts"
      :key="t.id"
      data-testid="toast"
      role="status"
      :class="['rounded-lg border px-4 py-3 text-sm shadow-lg', t.type === 'error' ? 'border-red-300 bg-red-50 text-red-800' : 'border-emerald-300 bg-emerald-50 text-emerald-800']"
    >
      {{ t.msg }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>
