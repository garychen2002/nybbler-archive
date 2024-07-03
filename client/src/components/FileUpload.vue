<script setup lang="ts">
import { ref } from 'vue'
import { apiProjectsBinaries } from '../services/api'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const selectedFile = ref<File | null>(null)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  } else {
    selectedFile.value = null
  }
}

const submitFile = async () => {
  if (!selectedFile.value) {
    alert('No file selected')
    return
  }

  const formData = new FormData()
  formData.append('binary_file', selectedFile.value)
  formData.append('projectId', props.projectId)
  apiProjectsBinaries.post(formData)
}
</script>

<template>
  <div>
    <input type="file" name="binary_file" @change="handleFileUpload" />
    <button @click="submitFile">Upload</button>
  </div>
</template>
