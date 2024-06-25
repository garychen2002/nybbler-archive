<script setup lang="ts">
import type { Binary, BinarySymbol } from '@/models/binaries/binary'
import type { Project } from '@/models/project'

defineProps<{
  project: Project
  binary: Binary
  symbol?: BinarySymbol
}>()
</script>

<template>
  <textarea class="h-[50vh] w-[75vw]">
    0x10000   mov     here, there
  </textarea>
</template>
