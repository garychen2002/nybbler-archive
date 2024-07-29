<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const show = defineModel<boolean>('show', { required: true })

const emit = defineEmits<{
  submit: [text: string]
}>()

const text = ref<string>('')
watchEffect(() => {
  if (!show.value) {
    text.value = ''
  }
})

function submit() {
  show.value = false
  emit('submit', text.value)
}
</script>

<template>
  <VaModal v-model="show" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">add inline comment</h3>
    <VaForm class="mb-4 flex flex-col items-baseline gap-6" @submit="submit">
      <VaInput v-model="text" class="w-full" autofocus label="comment text" />
    </VaForm>

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (show = false)"> cancel </VaButton>
      <VaButton color="primary" @click="submit"> add </VaButton>
    </template>
  </VaModal>
</template>
