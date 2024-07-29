<script setup lang="ts">
import type { ProjectMetadata } from '@/models/project_metadata'
import UserBubble from './UserBubble.vue'

defineProps<{
  project: ProjectMetadata
}>()

defineEmits<{
  invite: [ProjectMetadata]
  rename: [ProjectMetadata]
  leave: [ProjectMetadata]
}>()
</script>

<template>
  <VaCard :to="`/projects/${project.id}`" class="m-4 w-6/12 md:w-4/12 lg:w-3/12">
    <div class="va-card__title font-bold">{{ project.name }}</div>
    <VaCardContent class="text-sm" v-if="project.invitees.length">
      <span class="font-semibold">collaborators:</span>
      <UserBubble v-for="user in project.invitees" :key="user.id" :user="user" class="ms-1" />
    </VaCardContent>
    <VaCardActions>
      <VaButton preset="secondary" @click.prevent="$emit('invite', project)"> invite </VaButton>
      <VaButton preset="secondary" color="secondary" @click.prevent="$emit('rename', project)">
        rename
      </VaButton>
      <VaButton preset="secondary" text-color="danger" @click.prevent="$emit('leave', project)">
        leave
      </VaButton>
    </VaCardActions>
  </VaCard>
</template>
