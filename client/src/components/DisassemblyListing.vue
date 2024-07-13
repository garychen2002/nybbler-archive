<script setup lang="ts">
import type { Binary } from '@/models/binaries/binary'
import type { Project } from '@/models/project'
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  project: Project
  binary: Binary
  address?: string
}>()

const listingTextarea = ref<HTMLTextAreaElement>()

function measureLineHeight(textarea: HTMLTextAreaElement): number {
  // https://chatgpt.com/share/f2b808b3-a73e-41b4-8a5d-53fce6185ba5
  return Number(getComputedStyle(textarea).lineHeight.replace(/[^\d.]/g, ''))
}

function findAddressLineNumber(address: string, disassembly: string): number {
  return disassembly.split('\n').findIndex((line) => line.search(address) === 1) + 1
}

watchEffect(() => {
  const textarea = listingTextarea.value

  if (props.address && textarea) {
    const lineNumber = findAddressLineNumber(props.address, props.binary.disassembly)
    if (!lineNumber) {
      alert(`Sorry, couldn't find this address (${props.address}) in the disassembly.`)
      return
    }

    textarea.scrollTop = measureLineHeight(textarea) * (lineNumber - 2)
  }
})
</script>

<template>
  <div class="h-full rounded-sm border-2 border-solid border-primary p-2">
    <textarea
      ref="listingTextarea"
      class="h-full w-[50em] resize-none text-nowrap font-mono text-xs"
      disabled
      :value="binary.disassembly"
    >
    </textarea>
  </div>
</template>

<style scoped></style>
