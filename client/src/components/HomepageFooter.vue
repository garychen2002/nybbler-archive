<script setup lang="ts">
import NavItem from '@/components/NavItem.vue'

const { VITE_API_BASE_URL } = import.meta.env
</script>

<template>
  <footer class="w-full flex-none px-8">
    <VaNavbar color="#F4F8FA">
      <template #left>
        <NavItem label="nybbler" to="/" />
        <NavItem label="about" to="/about" />
      </template>
      <template #center>
        <NavItem label="login" :to="`${VITE_API_BASE_URL}/auth/signup`" />
      </template>
      <template #right> </template>
    </VaNavbar>
  </footer>
</template>
