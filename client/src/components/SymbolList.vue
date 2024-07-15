<script setup lang="ts">
import type { BinarySymbol } from '@/models/binary'
import type { CollabSymbolOverrides } from '@/models/collab'
import { sortBy } from 'lodash'
import { computed } from 'vue'
import { VaButton, VaIcon, VaList, VaListItem } from 'vuestic-ui'

const props = defineProps<{
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

const sortedSymbols = computed(() =>
  sortBy(
    props.symbols,
    (symbol) => symbol.functionId,
    (symbol) => symbol.address
  )
)
</script>

<template>
  <VaList class="text-xs">
    <VaListItem
      v-for="symbol in sortedSymbols"
      :key="symbol.address"
      :to="
        symbol.functionId
          ? {
              name: 'project-binary-function',
              params: {
                projectId: projectId,
                binaryId: binaryId,
                functionId: symbol.functionId
              }
            }
          : ''
      "
      class="group"
      :class="{
        'va-link': !!symbol.functionId
      }"
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
