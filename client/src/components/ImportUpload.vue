<script setup lang="ts">
import { apiProjects } from '@/services/api'
import { ref } from 'vue'
import { VaButton, useToast } from 'vuestic-ui'
import FileUpload from './FileUpload.vue'

const props = defineProps<{
  projectId: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const showModal = ref(false)

const toast = useToast()

async function upload(files: File[]) {
  await Promise.all(
    files.map(async (file) => {
      const toastID = toast.init({ message: `importing ${file.name}…`, duration: -1 })

      const formData = new FormData()
      formData.append('file', file)
      try {
        await apiProjects.put(`${props.projectId}/exported`, formData)
        toast.notify({ message: `${file.name} imported.`, color: 'success' })
      } catch (error) {
        toast.notify({
          message: `failed to import ${file.name}. please check your project file for validity, or try again.`,
          color: 'danger'
        })
        console.error(error)
      } finally {
        toast.close(toastID!)
        emit('complete')
      }
    })
  )
}
</script>

<template>
  <FileUpload
    modalTitle="import project"
    fileTypes=".zip,application/zip"
    v-model:show="showModal"
    @upload="upload"
  >
    <template #button>
      <VaButton v-bind="$attrs" @click="() => (showModal = true)" preset="primary">
        import
        <VaIcon name="drive_folder_upload" class="ms-2" />
      </VaButton>
    </template>
  </FileUpload>
</template>
