<template>
  <div class="mx-auto max-w-4xl">
    <LoginForm kind="Tenant" area="tenant" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({ title: 'Login Tenant - UPGR' })
</script>
