<script setup lang="ts">
import ProjectItem from '@/components/ProjectItem.vue'
import type { Project } from '@/models'
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
  <div class="flex">
    <ProjectItem
      v-for="project in projectsStore.projects"
      :key="project.id"
      :project="project"
      @edit="editProject"
      @delete="deleteProject"
    />
  </div>
</template>
