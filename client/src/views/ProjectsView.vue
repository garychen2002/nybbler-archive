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

  <VaModal
    v-model="showRenameModal"
    ok-text="Rename"
    :ok-disabled="!(renameForm?.isValid ?? false)"
    @ok="submitRenameForm"
  >
    <template v-if="projectToRename">
      <h3 class="va-h6 mb-4">Rename project</h3>
      <VaForm
        ref="renameForm"
        class="flex flex-col items-baseline gap-6"
        @submit="submitRenameForm"
      >
        <VaInput
          autofocus
          ref="renameFormNameField"
          class="w-full"
          v-model="projectToRename.name"
          :rules="[(value) => (value && value.length > 0) || 'Enter a name']"
        />
      </VaForm>
    </template>
  </VaModal>
</template>
