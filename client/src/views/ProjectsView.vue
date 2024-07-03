<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import type { Project } from '@/models/project'
import { useProjectsStore } from '@/stores/projects'
import { watchEffect } from 'vue'

const projectsStore = useProjectsStore()

watchEffect(async () => {
  await projectsStore.init()
})

function editProject(project: Project) {
  // TODO: show modal or something
  alert('unimplemented')
}

function deleteProject(project: Project) {
  projectsStore.delete(project)
}
</script>

<template>
  <div class="flex w-full items-start">
    <ProjectCard
      v-for="project in projectsStore.projects"
      :key="project.id"
      :project="project"
      @edit="editProject"
      @delete="deleteProject"
    />
  </div>
</template>
