<template>
  <div class="mx-auto max-w-4xl">
    <LoginForm kind="Provider" area="provider" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Login Provider - UPGR' })
</script>
