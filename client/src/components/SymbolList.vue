<script setup lang="ts">
import type { BinarySymbol } from '@/models/binaries/binary'
import type { CollabSymbolOverrides } from '@/models/collab'
import { VaButton, VaIcon, VaList, VaListItem } from 'vuestic-ui'

defineProps<{
  projectId: number
  binaryId: number

  symbols: BinarySymbol[]
  selectedSymbol?: BinarySymbol

  overrides: CollabSymbolOverrides

  isBookmarkList?: boolean
}>()

defineEmits<{
  rename: [symbol: BinarySymbol]
  bookmark: [symbol: BinarySymbol]
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
        {{ overrides[symbol.address] ?? symbol.name }}

        <div class="invisible flex gap-1 group-hover:visible">
          <VaButton
            size="small"
            preset="primary"
            :title="isBookmarkList ? 'unbookmark' : 'bookmark'"
            @click.prevent="$emit('bookmark', symbol)"
          >
            <VaIcon :name="isBookmarkList ? 'bookmark_remove' : 'bookmark_add'" />
          </VaButton>
          <VaButton
            size="small"
            preset="primary"
            title="rename"
            @click.prevent="$emit('rename', symbol)"
          >
            <VaIcon name="edit" />
          </VaButton>
        </div>
      </div>
    </VaListItem>
  </VaList>
</template>

<style scoped>
.selected-symbol {
  background-color: #dee5f2 !important;
}
</style>
