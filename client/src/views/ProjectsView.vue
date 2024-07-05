<script setup lang="ts">
import NewProject from '@/components/NewProject.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ProjectMetadata } from '@/models/project_metadata'
import { signIn } from '@/services/auth'
import { useProjectsStore } from '@/stores/projects'
import { ref, watchEffect } from 'vue'
import { useModal } from 'vuestic-ui'
import RenameProjectModal from '../components/RenameProjectModal.vue'

const projectsStore = useProjectsStore()

watchEffect(async () => {
  await projectsStore.init()
})

const showRenameModal = ref(false)
const projectToRename = ref<ProjectMetadata>()

function showRename(project: ProjectMetadata) {
  showRenameModal.value = true
  projectToRename.value = { ...project }
}

async function submitRename(renamedProject: ProjectMetadata | undefined) {
  showRenameModal.value = false
  if (!renamedProject) return

  // TODO: remove this
  await signIn('alice@example.com')

  await projectsStore.update(renamedProject)
}

const modal = useModal()

async function leaveProject(project: ProjectMetadata) {
  const ok = await modal.confirm({
    message: `really leave “${project.name}”?`,
    size: 'small',
    cancelText: 'cancel',
    okText: 'leave'
  })
  if (!ok) return

  projectsStore.leave(project)
}
</script>

<template>
  <div class="flex w-full flex-col">
    <div class="mb-4 flex">
      <h1 class="va-h6">projects</h1>
      <NewProject />
    </div>

    <div class="flex flex-wrap items-start">
      <ProjectCard
        v-for="project in projectsStore.projects"
        :key="project.id"
        :project="project"
        @rename="showRename"
        @leave="leaveProject"
      />
    </div>
  </div>

  <RenameProjectModal
    v-model:show="showRenameModal"
    :project="projectToRename"
    @submit="submitRename"
  />
</template>
