<script setup lang="ts">
import DisassemblyListing from '@/components/DisassemblyListing.vue'
import FileUpload from '@/components/FileUpload.vue'
import PageContent from '@/components/PageContent.vue'
import RenameSymbolModal from '@/components/RenameSymbolModal.vue'
import SymbolList from '@/components/SymbolList.vue'
import UserBubble from '@/components/UserBubble.vue'
import type { BinarySymbol } from '@/models/binary'
import type {
  CollabBookmarkedAddresses,
  CollabProject,
  CollabSymbolOverrides
} from '@/models/collab'
import type { Project } from '@/models/project'
import { apiProjects } from '@/services/api'
import { repo } from '@/services/automerge'
import { useCollabUserState } from '@/services/collab_user_state'
import { useMeStore } from '@/stores/me'
import type { Doc } from '@automerge/automerge-repo'
import { indexOf } from 'lodash'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { VaIcon, VaInnerLoading } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
  binaryId?: string
  address?: string
}>()

const project = ref<Project>()
async function fetchProject() {
  project.value = await apiProjects.get<Project>(props.projectId)
}

watchEffect(async () => {
  await fetchProject()
})
// https://router.vuejs.org/guide/advanced/composition-api.html#Navigation-Guards
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.projectId !== from.params.projectId) {
    await fetchProject()
  }
})

const selectedBinary = computed(() =>
  project.value?.binaries.find((binary) => `${binary.id}` === props.binaryId)
)
const selectedSymbol = computed(() =>
  selectedBinary.value?.symbols.find((symbol) => symbol.address === props.address)
)

const router = useRouter()

// Default binary selection
watchEffect(() => {
  if (!selectedBinary.value) {
    const firstBinary = project.value?.binaries[0]
    if (firstBinary) {
      router.replace({
        name: 'project-binary',
        params: { projectId: project.value!.id, binaryId: firstBinary.id }
      })
    }
  }
})

// Sync tab selection with current route
const selectedBinaryID = ref<number | undefined>(Number(props.binaryId))
watch(
  () => props.binaryId,
  (newValue) => {
    selectedBinaryID.value = Number(newValue)
  }
)
watch(selectedBinaryID, (newValue) => {
  router.push({
    name: 'project-binary',
    params: { projectId: project.value.id, binaryId: `${newValue}` }
  })
})

const symbolOverrides = ref<CollabSymbolOverrides>({})
const bookmarkedAddresses = ref<CollabBookmarkedAddresses>([])

const automergeDocumentHandle = computed(() =>
  project.value ? repo.find<CollabProject>(project.value.automergeDocumentId) : undefined
)

const meStore = useMeStore()
watchEffect(async () => {
  await meStore.init()
})

const { userStates, broadcastUserState, stopBroadcastingUserState, listenForUserStates } =
  useCollabUserState()

function updateFromAutomergeDocument(doc: Doc<CollabProject>) {
  if (selectedBinaryID.value) {
    symbolOverrides.value = doc.binaries?.[selectedBinaryID.value]?.symbolOverrides ?? {}
    bookmarkedAddresses.value = doc.binaries?.[selectedBinaryID.value]?.bookmarkedAddresses ?? []
  }

  broadcastUserState(automergeDocumentHandle.value, {
    user: meStore.user,
    binaryID: selectedBinaryID.value
  })
}

onBeforeUnmount(() => {
  stopBroadcastingUserState()
})

watch([automergeDocumentHandle, selectedBinaryID], async () => {
  if (!automergeDocumentHandle.value) return

  listenForUserStates(automergeDocumentHandle.value)

  const doc = await automergeDocumentHandle.value.doc()
  if (doc) {
    updateFromAutomergeDocument(doc)
  }

  automergeDocumentHandle.value.on('change', ({ doc }) => {
    updateFromAutomergeDocument(doc)
  })
})

const bookmarkedAddressesSet = computed(() => new Set(bookmarkedAddresses.value))
const bookmarkedSymbols = computed(
  () =>
    selectedBinary.value?.symbols.filter((symbol) =>
      bookmarkedAddressesSet.value.has(symbol.address)
    ) ?? []
)
const nonBookmarkedSymbols = computed(
  () =>
    selectedBinary.value?.symbols.filter(
      (symbol) => !bookmarkedAddressesSet.value.has(symbol.address)
    ) ?? []
)

async function toggleSymbolBookmarked(symbol: BinarySymbol) {
  if (!automergeDocumentHandle.value) return

  await automergeDocumentHandle.value.whenReady()
  automergeDocumentHandle.value.change((doc) => {
    if (selectedBinaryID.value) {
      doc.binaries ??= {}
      doc.binaries[selectedBinaryID.value] ??= {}
      doc.binaries[selectedBinaryID.value].bookmarkedAddresses ??= []

      const index = indexOf(
        doc.binaries[selectedBinaryID.value].bookmarkedAddresses,
        symbol.address
      )
      if (index === -1) {
        // Bookmark this symbol
        doc.binaries[selectedBinaryID.value].bookmarkedAddresses!.push(symbol.address)
      } else {
        // Unbookmark this symbol
        doc.binaries[selectedBinaryID.value].bookmarkedAddresses!.splice(index, 1)
      }
    }
  })
  updateFromAutomergeDocument((await automergeDocumentHandle.value.doc())!)
}

const showRenameSymbolModal = ref(false)
const symbolToRename = ref<BinarySymbol>()

function showRenameSymbol(symbol: BinarySymbol) {
  showRenameSymbolModal.value = true
  symbolToRename.value = { ...symbol }
}

async function submitRenameSymbol(newName: string) {
  showRenameSymbolModal.value = false
  if (!automergeDocumentHandle.value) return

  await automergeDocumentHandle.value.whenReady()
  automergeDocumentHandle.value.change((doc) => {
    if (selectedBinaryID.value && symbolToRename.value) {
      doc.binaries ??= {}
      doc.binaries[selectedBinaryID.value] ??= {}
      doc.binaries[selectedBinaryID.value].symbolOverrides ??= {}
      doc.binaries[selectedBinaryID.value].symbolOverrides![symbolToRename.value.address] = newName
    }
  })
  updateFromAutomergeDocument((await automergeDocumentHandle.value.doc())!)
}
</script>

<template>
  <PageContent class="pt-8">
    <VaInnerLoading :loading="!project">
      <div v-if="project" class="h-full">
        <div class="mb-2 flex">
          <VaButton to="/projects" preset="primary" class="me-4" title="return to projects">
            <VaIcon name="arrow_back" />
          </VaButton>

          <h1 class="va-h6">
            {{ project.name }}
          </h1>

          <FileUpload :projectId="props.projectId" class="ms-auto" />
        </div>

        <VaTabs v-model="selectedBinaryID" class="project-view-main-tabs items-start">
          <template #tabs>
            <VaTab v-for="binary in project.binaries" :key="binary.id" :name="binary.id">
              <span class="me-1">{{ binary.name }}</span>
              <UserBubble
                v-for="userState in userStates.filter((state) => state.binaryID === binary.id)"
                :key="userState.user!.id"
                :user="userState.user!"
                class="ms-1"
              />
            </VaTab>
          </template>

          <splitpanes v-if="selectedBinary" class="default-theme outer-splitpanes w-full py-4">
            <pane min-size="20">
              <div class="flex h-full flex-col gap-2 p-4">
                <h2 class="va-h6">symbols</h2>

                <div class="flex flex-col">
                  <div class="pb-1">
                    <div
                      class="h-[28vh] overflow-auto rounded-sm border-2 border-solid border-primary p-2"
                    >
                      <SymbolList
                        :projectId="project.id"
                        :binaryId="selectedBinary.id"
                        :symbols="bookmarkedSymbols"
                        :selectedSymbol="selectedSymbol"
                        :overrides="symbolOverrides ?? {}"
                        isBookmarkList
                        @bookmark="toggleSymbolBookmarked"
                        @rename="showRenameSymbol"
                      />
                    </div>
                  </div>

                  <div class="pt-1">
                    <div
                      class="h-[40.49vh] overflow-auto rounded-sm border-2 border-solid border-primary p-2"
                    >
                      <SymbolList
                        :projectId="project.id"
                        :binaryId="selectedBinary.id"
                        :symbols="nonBookmarkedSymbols"
                        :selectedSymbol="selectedSymbol"
                        :overrides="symbolOverrides ?? {}"
                        @bookmark="toggleSymbolBookmarked"
                        @rename="showRenameSymbol"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </pane>

            <pane min-size="40">
              <div class="flex h-full flex-col gap-2 p-4">
                <h2 class="va-h6">disassembly</h2>

                <DisassemblyListing
                  :project="project"
                  :binary="selectedBinary"
                  :address="address"
                />
              </div>
            </pane>
          </splitpanes>
        </VaTabs>
      </div>
    </VaInnerLoading>

    <RenameSymbolModal
      v-model:show="showRenameSymbolModal"
      :currentName="
        symbolToRename
          ? symbolOverrides?.[symbolToRename.address] ?? symbolToRename.name
          : undefined
      "
      @submit="submitRenameSymbol"
    />
  </PageContent>
</template>

<style scoped>
.project-view-main-tabs :deep(.va-tabs__content) {
  width: 100%;
}

:deep(.splitpanes--vertical > .splitpanes__splitter) {
  min-width: 12px !important;
  background: var(--va-background-element) !important;
}

:deep(.splitpanes--horizontal > .splitpanes__splitter) {
  min-height: 12px !important;
  background: var(--va-background-element) !important;
}

.outer-splitpanes {
  height: calc(100vh - 130px);
}
</style>
