<script setup lang="ts">
defineProps<{
  label: string
  to: string
}>()
const { VITE_API_BASE_URL } = import.meta.env
</script>

<template>
  <VaNavbarItem>
    <template v-if="to.startsWith(VITE_API_BASE_URL)">
      <a :href="to">
        <VaButton preset="secondary">{{ label }}</VaButton>
      </a>
    </template>
    <template v-else>
      <RouterLink :to="to">
        <VaButton preset="secondary">{{ label }}</VaButton>
      </RouterLink>
    </template>
  </VaNavbarItem>
</template>
