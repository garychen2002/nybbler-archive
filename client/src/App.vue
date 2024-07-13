<script setup lang="ts">
import NavItem from './components/NavItem.vue'
const { VITE_API_BASE_URL } = import.meta.env
const loginTo = `${VITE_API_BASE_URL}/auth/signup/`
</script>

<template>
  <div class="flex h-screen w-screen flex-col items-center">
    <main class="flex w-full flex-grow justify-center px-12 pt-12">
      <RouterView />
    </main>

    <footer class="w-full flex-none px-8">
      <VaNavbar color="#F4F8FA">
        <template #left>
          <NavItem label="nybbler" to="/" />
          <NavItem label="about" to="/about" />
        </template>
        <template #center>
          <NavItem label="projects" to="/projects" />
        </template>
        <template #right> 
          <NavItem label="login" :to="loginTo" />
        </template>
      </VaNavbar>
    </footer>
  </div>
</template>

<style scoped></style>
