<script setup lang="ts">
import NavItem from './components/NavItem.vue'
</script>

<template>
  <header class="mx-8">
    <VaNavbar color="#F4F8FA">
      <template #left>
        <NavItem label="nybbler" to="/" />
        <NavItem label="about" to="/about" />
      </template>
      <template #center>
        <NavItem label="projects" to="/projects" />
      </template>
      <template #right> </template>
    </VaNavbar>
  </header>

  <main class="m-12">
    <RouterView />
  </main>
</template>

<style scoped></style>
