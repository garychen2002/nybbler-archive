<script setup lang="ts">
defineProps<{
  label: string
  to: string
}>()
</script>

<template>
  <VaNavbarItem>
    <RouterLink :to="to">
      <VaButton preset="secondary">{{ label }}</VaButton>
    </RouterLink>
  </VaNavbarItem>
</template>
