<script setup lang="ts">
import { apiProjectsBinaries } from '@/services/api'
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
      const toastID = toast.init({ message: `uploading ${file.name}…`, duration: -1 })

      const formData = new FormData()
      formData.append('binary_file', file)
      formData.append('projectId', props.projectId)
      try {
        await apiProjectsBinaries.post(formData)
        toast.notify({ message: `${file.name} uploaded.`, color: 'success' })
      } catch (error) {
        toast.notify({
          message: `failed to upload ${file.name}. please try again later, or report a bug.`,
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
  <FileUpload modalTitle="upload binaries" fileTypes="" v-model:show="showModal" @upload="upload">
    <template #button>
      <VaButton v-bind="$attrs" @click="() => (showModal = true)">
        upload binaries
        <VaIcon name="upload" class="ms-2" />
      </VaButton>
    </template>
  </FileUpload>
</template>
