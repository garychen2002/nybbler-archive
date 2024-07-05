<script setup lang="ts">
import type { ProjectMetadata } from '@/models/project_metadata'
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  project?: ProjectMetadata
}>()

const show = defineModel<boolean>('show', { required: true })

defineEmits<{
  submit: [ProjectMetadata | undefined]
}>()

const mutableProject = ref<ProjectMetadata>()
watchEffect(() => {
  if (props.project) {
    mutableProject.value = { ...props.project }
  }
})
</script>

<template>
  <VaModal v-model="show" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">rename project</h3>
    <VaForm
      class="mb-4 flex flex-col items-baseline gap-6"
      @submit="$emit('submit', mutableProject)"
    >
      <VaInput
        v-if="mutableProject"
        v-model="mutableProject.name"
        class="w-full"
        autofocus
        label="project name"
      />
    </VaForm>

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (show = false)"> cancel </VaButton>
      <VaButton color="primary" @click="$emit('submit', mutableProject)"> rename </VaButton>
    </template>
  </VaModal>
</template>
