<script setup lang="ts">
import { fetchFunction, type Function } from '@/models/function'
import type { Project } from '@/models/project'
import MonacoEditor from 'monaco-editor-vue3'
import { onMounted, ref, watch } from 'vue'
import { VaInnerLoading } from 'vuestic-ui'
import './syntax_highlight_langs'

const props = defineProps<{
  project: Project
  functionId?: string
}>()

async function fetchCurrentFunction() {
  const functionId = Number(props.functionId)
  if (functionId) {
    function_.value = undefined
    function_.value = await fetchFunction(functionId)
  } else {
    function_.value = null
  }
}

const function_ = ref<Function | null | undefined>(null)
watch([() => props.functionId], fetchCurrentFunction)

onMounted(async () => {
  await fetchCurrentFunction()
})
</script>

<template>
  <VaInnerLoading
    :loading="function_ === undefined"
    class="flex-0 flex h-full w-full flex-col overflow-auto text-nowrap rounded-sm border-2 border-solid border-primary p-2 text-xs leading-relaxed"
  >
    <template v-if="function_">
      <MonacoEditor
        language="x86asm"
        theme="nybbler"
        :value="function_.disassembly"
        :options="{
          minimap: { enabled: false },
          readOnly: true,
          domReadOnly: true
        }"
      />
    </template>
  </VaInnerLoading>
</template>
