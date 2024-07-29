<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { VaButton, VaCheckbox, VaFileUpload } from 'vuestic-ui'

const props = defineProps<{
  modalTitle: string
  fileTypes: string
  multiple?: boolean
}>()

const show = defineModel<boolean>('show', { required: true })
const checked = defineModel<boolean>('checked', { required: true })

const emit = defineEmits<{
  upload: [selectedFiles: File[]]
}>()

const selectedFiles_ = ref<File[]>([])
const selectedFiles = computed({
  get() {
    return selectedFiles_.value
  },
  set(newValue: File[]) {
    selectedFiles_.value = props.multiple ? newValue : newValue.slice(0, 1)
  }
})

watchEffect(() => {
  if (!show.value) {
    selectedFiles.value = []
  }
})

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

  emit('upload', selectedFiles.value)
  show.value = false
  selectedFiles.value = []
}
</script>

<template>
  <slot name="button"></slot>

  <VaModal v-model="show" hide-default-actions>
    <h3 class="va-h6 mb-4">{{ modalTitle }}</h3>
    <VaFileUpload
      v-model="selectedFiles"
      :file-types="fileTypes"
      dropzone
      drop-zone-text="drop here, or"
      upload-button-text="choose"
      class="cursor-default"
    />
    <template v-if="modalTitle == 'upload binaries'">
      <p class="m-0 mt-4 text-sm">your binary will be analyzed server-side.</p>
      <VaCheckbox
        v-model="checked"
        class="mb-6 mt-4"
        label="also send to VirusTotal for malware scanning"
      />
    </template>
    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (show = false)"> cancel </VaButton>
      <VaButton color="primary" @click="submitFile"> upload </VaButton>
    </template>
  </VaModal>
</template>
