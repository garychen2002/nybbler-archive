<script setup lang="ts">
import ProjectCard from '@/components/ProjectCard.vue'
import type { Project } from '@/models/project'
import { signIn } from '@/services/auth'
import { useProjectsStore } from '@/stores/projects'
import { ref, watchEffect } from 'vue'
import { VaForm, VaInput, useForm } from 'vuestic-ui'

const projectsStore = useProjectsStore()

watchEffect(async () => {
  await projectsStore.init()
})

const projectToRename = ref<Project>()
const showRenameModal = ref(false)

function showRenameForm(project: Project) {
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
      @rename="showRenameForm"
      @delete="deleteProject"
    />
  </div>

  <VaModal v-model="showRenameModal" hide-default-actions>
    <h3 class="va-h6 mb-4">rename project</h3>
    <VaForm ref="renameForm" class="flex flex-col items-baseline gap-6" @submit="submitRenameForm">
      <VaInput
        v-if="projectToRename"
        v-model="projectToRename.name"
        ref="renameFormNameField"
        class="w-full"
        autofocus
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
