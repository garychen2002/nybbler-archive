<script setup lang="ts">
import { fetchFunction, type Function } from '@/models/function'
import type { Project } from '@/models/project'
import { onMounted, ref, watch } from 'vue'
import { VaInnerLoading } from 'vuestic-ui'

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
  <div
    class="flex h-full w-full content-center justify-center rounded-sm border-2 border-solid border-primary p-2 text-xs"
  >
    <VaInnerLoading :loading="function_ === undefined">
      <textarea
        ref="listingTextarea"
        class="h-full w-full resize-none text-nowrap font-mono text-xs"
        disabled
        v-if="function_"
        :value="function_.disassembly"
      >
      </textarea>
    </VaInnerLoading>
  </div>
</template>
