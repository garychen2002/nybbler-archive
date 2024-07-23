<script setup lang="ts">
import { ref } from 'vue'
import { VaButton, VaFileUpload, useToast } from 'vuestic-ui'
import { apiProjectsBinaries } from '../services/api'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
}>()

const selectedFiles = ref<File[]>([])
const showUploadModal = ref(false)
const checked = ref(false)

const toast = useToast()

const FILE_SIZE_LIMIT = 32 * 1024 * 1024 // 32 mib in bytes
// defined server side in docker compose

const submitFile = async () => {
  if (!selectedFiles.value.length) {
    alert('No file selected')
    return
  }

  if (selectedFiles.value.some((file) => file.size > FILE_SIZE_LIMIT)) {
    alert('A file is too large.')
    return
  }

  showUploadModal.value = false

  await Promise.all(
    selectedFiles.value.map(async (file) => {
      const toastID = toast.init({ message: `analyzing ${file.name}…`, duration: -1 })

      const formData = new FormData()
      formData.append('binary_file', file)
      formData.append('projectId', props.projectId)
      formData.append('virustotal', checked.value.toString())
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
        emit('complete')
      }
    })
  )

  selectedFiles.value = []
}
</script>

<template>
  <VaButton v-bind="$attrs" @click="() => (showUploadModal = true)">
    upload binaries
    <VaIcon name="upload" class="ms-2" />
  </VaButton>

  <VaModal v-model="showUploadModal" hide-default-actions>
    <h3 class="va-h6 mb-4">upload binaries</h3>
    <VaFileUpload
      v-model="selectedFiles"
      dropzone
      drop-zone-text="drop here, or"
      upload-button-text="choose"
      class="cursor-default"
    />
    <input type="checkbox" id="virustotal" v-model="checked" />
    <label for="virustotal">Upload to VirusTotal</label>
    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (showUploadModal = false)">
        cancel
      </VaButton>
      <VaButton color="primary" @click="submitFile"> upload </VaButton>
    </template>
  </VaModal>
</template>
