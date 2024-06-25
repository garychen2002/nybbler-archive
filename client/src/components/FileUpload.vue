<script setup lang="ts">
import { ref } from 'vue'
import { apiProjects } from '../api'

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
  formData.append('file', selectedFile.value)
  apiProjects.post(formData, {
    projectId: props.projectId
  })
}
</script>

<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button @click="submitFile">Upload</button>
  </div>
</template>
