<script setup lang="ts">
import NavItem from './components/NavItem.vue'
</script>

<template>
  <VaLayout :top="{ fixed: true }">
    <template #top>
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
    </template>

    <main class="m-12">
      <RouterView />
    </main>
  </VaLayout>
</template>

<style scoped></style>
