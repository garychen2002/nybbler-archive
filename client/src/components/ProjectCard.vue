<script setup lang="ts">
import type { ProjectMetadata } from '@/models/project_metadata'

defineProps<{
  project: ProjectMetadata
}>()

defineEmits<{
  rename: [ProjectMetadata]
  leave: [ProjectMetadata]
}>()
</script>

<template>
  <VaCard :to="`/projects/${project.id}`" class="m-4 w-3/12">
    <div class="va-card__title font-bold">{{ project.name }}</div>
    <VaCardContent class="text-sm" v-if="project.invitees.length">
      <span class="font-semibold">collaborators: </span>
      {{ project.invitees.map(({ name }) => name).join(', ') }}
    </VaCardContent>
    <VaCardActions>
      <VaButton preset="secondary" @click.prevent="$emit('rename', project)"> rename </VaButton>
      <VaButton preset="secondary" text-color="danger" @click.prevent="$emit('leave', project)">
        leave
      </VaButton>
    </VaCardActions>
  </VaCard>
</template>
