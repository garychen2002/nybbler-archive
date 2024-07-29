<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  existingText?: string
}>()

const show = defineModel<boolean>('show', { required: true })

const emit = defineEmits<{
  submit: [text: string | undefined]
}>()

const text = ref<string>('')
watch(
  () => props.existingText,
  () => {
    text.value = props.existingText ?? ''
  }
)

function save() {
  show.value = false
  emit('submit', text.value)
}

function remove() {
  show.value = false
  emit('submit', undefined)
}
</script>

<template>
  <VaModal v-model="show" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">edit inline comment</h3>
    <VaForm class="mb-4 flex flex-col items-baseline gap-6" @submit="save">
      <VaTextarea v-model="text" class="w-full" autofocus label="comment text" />
    </VaForm>

    <template #footer>
      <VaButton
        v-if="existingText"
        class="me-auto"
        preset="secondary"
        color="danger"
        @click="remove"
      >
        remove this comment
      </VaButton>

      <VaButton class="me-3" preset="secondary" @click="() => (show = false)"> cancel </VaButton>
      <VaButton color="primary" @click="save"> save </VaButton>
    </template>
  </VaModal>
</template>
