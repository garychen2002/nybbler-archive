<script setup lang="ts">
import type { Project } from '@/models'

defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="item">
    {{ project.name }}
  </div>
</template>
