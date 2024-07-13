<script setup lang="ts">
import HomepageFooter from '@/components/HomepageFooter.vue'
</script>

<template>
  <div class="flex h-screen w-screen flex-col items-center">
    <main class="flex w-full flex-grow justify-center px-12 pt-12">
      <RouterView />
    </main>

    <HomepageFooter />
  </div>
</template>

<style scoped></style>
