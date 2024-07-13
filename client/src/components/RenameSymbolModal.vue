<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { VaButton } from 'vuestic-ui'

const props = defineProps<{
  currentName: string | undefined
}>()

const show = defineModel<boolean>('show', { required: true })

defineEmits<{
  submit: [string]
}>()

const name = ref<string>('')
watchEffect(() => {
  name.value = props.currentName ?? ''
})
</script>

<template>
  <VaModal v-model="show" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">rename symbol</h3>
    <VaForm class="mb-4 flex flex-col items-baseline gap-6" @submit="$emit('submit', name)">
      <VaInput v-model="name" class="w-full" autofocus label="symbol name" />
    </VaForm>

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (show = false)"> cancel </VaButton>
      <VaButton color="primary" @click="$emit('submit', name)"> rename </VaButton>
    </template>
  </VaModal>
</template>
