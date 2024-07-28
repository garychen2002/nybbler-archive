<script setup lang="ts">
import { apiProjects } from '@/services/api'
import { useToast, VaButton } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
}>()

function downloadFile(url: string, filename?: string) {
  const a = document.createElement('a')
  a.href = url
  if (filename) a.download = filename
  a.click()
}

const toast = useToast()

async function exportProject() {
  const toastID = toast.init({ message: `exporting project…`, duration: -1 })

  // https://stackoverflow.com/a/43133108
  try {
    const res = await apiProjects.get(`${props.projectId}/exported`, { responseAs: 'response' })
    const blob = await res.blob()

    downloadFile(
      URL.createObjectURL(blob),
      res.headers.get('Content-Disposition')?.match(/attachment;\s*filename="([^"]+)"/i)?.[1]
    )

    toast.notify({ message: `project exported.`, color: 'success' })
  } catch (error) {
    toast.notify({
      message: `failed to export project.`,
      color: 'danger'
    })
    console.error(error)
  } finally {
    toast.close(toastID!)
  }
}
</script>

<template>
  <VaButton v-bind="$attrs" @click="exportProject" preset="primary">
    export
    <VaIcon name="download" class="ms-2" />
  </VaButton>
</template>
