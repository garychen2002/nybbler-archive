<script setup lang="ts">
import { signIn } from '@/services/auth'
import { useProjectsStore } from '@/stores/projects'
import { ref, watchEffect } from 'vue'
import { VaButton } from 'vuestic-ui'

const projectsStore = useProjectsStore()

watchEffect(async () => {
  await projectsStore.init()
})

const name = ref<string>('')
const showNewProjectModal = ref(false)

function showNewProjectForm() {
  name.value = ''
  showNewProjectModal.value = true
}

async function submitNewProjectForm() {
  showNewProjectModal.value = false

  // TODO: remove this
  await signIn('alice@example.com')

  await projectsStore.create(name.value)
}
</script>

<template>
  <VaButton class="ms-auto" @click="showNewProjectForm">new project</VaButton>

  <VaModal v-model="showNewProjectModal" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">new project</h3>
    <VaForm class="mb-4 flex flex-col items-baseline gap-6" @submit="submitNewProjectForm">
      <VaInput v-model="name" class="w-full" autofocus label="project name" />
    </VaForm>

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (showNewProjectModal = false)">
        cancel
      </VaButton>
      <VaButton color="primary" @click="submitNewProjectForm"> create </VaButton>
    </template>
  </VaModal>
</template>
