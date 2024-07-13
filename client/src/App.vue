<script setup lang="ts">
import { RouterView } from 'vue-router'
import { restoreSession } from './services/auth'

restoreSession()
</script>

<template>
  <div class="flex h-screen w-screen flex-col items-center">
    <RouterView />
  </div>
</template>
