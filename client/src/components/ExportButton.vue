<script setup lang="ts">
import { apiProjects } from '@/services/api'
import { VaButton } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
}>()

function downloadFile(url: string) {
  const a = document.createElement('a')
  a.href = url
  a.click()
}

const { VITE_API_BASE_URL } = import.meta.env

async function exportProject() {
  downloadFile(VITE_API_BASE_URL + `/api/projects/${props.projectId}/exported`)
  await apiProjects.get(`${props.projectId}/exported`)
}
</script>

<template>
  <VaButton v-bind="$attrs" @click="exportProject" preset="primary">
    export
    <VaIcon name="download" class="ms-2" />
  </VaButton>
</template>
