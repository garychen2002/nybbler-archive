<script setup lang="ts">
import { ref } from 'vue'
import { VaButton, VaFileUpload, useToast } from 'vuestic-ui'
import { apiProjectsBinaries } from '../services/api'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const selectedFiles = ref<File[]>([])
const showUploadModal = ref(false)

const toast = useToast()

const submitFile = async () => {
  if (!selectedFiles.value.length) {
    alert('No file selected')
    return
  }

  showUploadModal.value = false

  await Promise.all(
    selectedFiles.value.map(async (file) => {
      const toastID = toast.init({ message: `analyzing ${file.name}…`, duration: -1 })

      const formData = new FormData()
      formData.append('binary_file', file)
      formData.append('projectId', props.projectId)
      try {
        await apiProjectsBinaries.post(formData)
        toast.notify({ message: `finished analyzing ${file.name}.`, color: 'success' })
      } catch (error) {
        toast.notify({
          message: `failed to analyze ${file.name}. please try again later, or report a bug.`,
          color: 'danger'
        })
        console.error(error)
      } finally {
        toast.close(toastID!)
      }
    })
  )

  selectedFiles.value = []
}
</script>

<template>
  <VaButton v-bind="$attrs" @click="() => (showUploadModal = true)">upload binaries</VaButton>

  <VaModal v-model="showUploadModal" hide-default-actions>
    <h3 class="va-h6 mb-4">upload binaries</h3>
    <VaFileUpload
      v-model="selectedFiles"
      dropzone
      drop-zone-text="drop here, or"
      upload-button-text="choose"
      class="cursor-default"
    />

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (showUploadModal = false)">
        cancel
      </VaButton>
      <VaButton color="primary" @click="submitFile"> upload </VaButton>
    </template>
  </VaModal>
</template>
