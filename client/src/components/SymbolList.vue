<script setup lang="ts">
import type { BinarySymbol } from '@/models/binaries/binary'
import type { CollabSymbolOverrides } from '@/models/collab'
import { VaButton, VaIcon, VaList, VaListItem } from 'vuestic-ui'

defineProps<{
  projectId: number
  binaryId: number

  symbols: BinarySymbol[]
  selectedSymbol?: BinarySymbol

  symbolOverrides: CollabSymbolOverrides
}>()

defineEmits<{
  rename: [symbol: BinarySymbol]
}>()
</script>

<template>
  <VaList class="h-full overflow-auto text-xs">
    <VaListItem
      v-for="symbol in symbols"
      :key="symbol.name"
      :to="{
        name: 'project-binary-address',
        params: {
          projectId: projectId,
          binaryId: binaryId,
          address: symbol.address
        }
      }"
      class="va-link group"
    >
      <div
        class="m-1 flex w-full items-center justify-between rounded p-1 font-mono"
        :class="{
          'selected-symbol': symbol.address === selectedSymbol?.address
        }"
      >
        {{ symbolOverrides[symbol.address] ?? symbol.name }}
        <VaButton
          size="small"
          preset="secondary"
          class="invisible group-hover:visible"
          @click="$emit('rename', symbol)"
        >
          <VaIcon name="edit" />
        </VaButton>
      </div>
    </VaListItem>
  </VaList>
</template>

<style scoped>
.selected-symbol {
  background-color: #dee5f2 !important;
}
</style>
