<script setup lang="ts">
import type { Project } from '@/models'

defineProps<{
  project: Project
}>()

defineEmits<{
  edit: [Project]
  delete: [Project]
}>()
</script>

<template>
  <VaCard :to="`/projects/${project.id}`" class="m-4 w-3/12">
    <VaCardTitle>{{ project.name }}</VaCardTitle>
    <VaCardContent>
      {{ project.invitees }}
    </VaCardContent>
    <VaCardActions>
      <VaButton preset="secondary" @click.prevent="$emit('edit', project)"> Edit </VaButton>
      <VaButton preset="secondary" text-color="danger" @click.prevent="$emit('delete', project)">
        Delete
      </VaButton>
    </VaCardActions>
  </VaCard>
</template>
