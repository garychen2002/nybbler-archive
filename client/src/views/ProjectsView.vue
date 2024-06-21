<script setup lang="ts">
import ProjectItem from '@/components/ProjectItem.vue'
import { useProjectsStore } from '@/stores/projects'
import { watchEffect } from 'vue'

const projectsStore = useProjectsStore()

watchEffect(async () => {
  await projectsStore.init()
})
</script>

<template>
  <ProjectItem v-for="project in projectsStore.projects" :key="project.id" :project="project" />
</template>
