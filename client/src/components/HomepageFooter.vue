<script setup lang="ts">
import NavItem from '@/components/NavItem.vue'
</script>

<template>
  <footer class="w-full flex-none px-8">
    <VaNavbar color="#F4F8FA">
      <template #left>
        <NavItem label="nybbler" to="/" />
        <NavItem label="about" to="/about" />
      </template>
      <template #center>
        <NavItem label="login" to="/login" />
      </template>
      <template #right> </template>
    </VaNavbar>
  </footer>
</template>
