<script setup lang="ts">
import type { BinarySymbol } from '@/models/binary'
import type { CollabSymbolOverrides } from '@/models/collab'
import type { CollabUserState } from '@/services/collab_user_state'
import { sortBy } from 'lodash'
import { computed } from 'vue'
import { VaButton, VaIcon, VaList, VaListItem } from 'vuestic-ui'
import UserBubble from './UserBubble.vue'

const props = defineProps<{
  projectId: number
  binaryId: number

  symbols: BinarySymbol[]
  selectedSymbol?: BinarySymbol

  overrides: CollabSymbolOverrides
  userStates: CollabUserState[]

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
        class="m-1 flex w-full items-center justify-between rounded p-1"
        :class="{
          'selected-symbol': symbol.address === selectedSymbol?.address
        }"
      >
        <div class="overflow-hidden text-ellipsis text-nowrap font-mono">
          {{ overrides[symbol.address] ?? symbol.name }}
        </div>

        <div>
          <UserBubble
            v-for="userState in userStates.filter(
              (state) => state.functionID === symbol.functionId
            )"
            :key="userState.user!.id"
            :user="userState.user!"
            class="ms-1"
          />
        </div>

        <div class="invisible flex gap-1 group-hover:visible">
          <VaButton size="small" preset="primary" @click.prevent="$emit('bookmark', symbol)">
            <VaIcon :name="isBookmarkList ? 'bookmark_remove' : 'bookmark_add'" />
            <tippy target="_parent">{{ isBookmarkList ? 'unbookmark' : 'bookmark' }}</tippy>
          </VaButton>
          <VaButton size="small" preset="primary" @click.prevent="$emit('rename', symbol)">
            <VaIcon name="edit" />
            <tippy target="_parent">rename</tippy>
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
