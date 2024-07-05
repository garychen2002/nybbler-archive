<script setup lang="ts">
import NewProject from '@/components/NewProject.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ProjectMetadata } from '@/models/project_metadata'
import { signIn } from '@/services/auth'
import { useProjectsStore } from '@/stores/projects'
import { ref, watchEffect } from 'vue'
import { VaForm, VaInput, useForm, useModal } from 'vuestic-ui'

const projectsStore = useProjectsStore()

watchEffect(async () => {
  await projectsStore.init()
})

const projectToRename = ref<ProjectMetadata>()
const showRenameModal = ref(false)

function showRenameForm(project: ProjectMetadata) {
  projectToRename.value = { ...project }
  showRenameModal.value = true
}

const renameForm = useForm('renameForm')
const renameFormNameField = ref<HTMLInputElement>()

async function submitRenameForm() {
  showRenameModal.value = false

  // TODO: remove this
  await signIn('alice@example.com')

  await projectsStore.update(projectToRename.value!)
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
        @rename="showRenameForm"
        @leave="leaveProject"
      />
    </div>
  </div>

  <VaModal v-model="showRenameModal" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">rename project</h3>
    <VaForm
      ref="renameForm"
      class="mb-4 flex flex-col items-baseline gap-6"
      @submit="submitRenameForm"
    >
      <VaInput
        v-if="projectToRename"
        v-model="projectToRename.name"
        ref="renameFormNameField"
        class="w-full"
        autofocus
        label="project name"
      />
    </VaForm>

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (showRenameModal = false)">
        cancel
      </VaButton>
      <VaButton color="primary" @click="submitRenameForm"> rename </VaButton>
    </template>
  </VaModal>
</template>
