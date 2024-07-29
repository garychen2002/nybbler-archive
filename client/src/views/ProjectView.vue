<script setup lang="ts">
import BinaryUpload from '@/components/BinaryUpload.vue'
import DisassemblyListing from '@/components/DisassemblyListing.vue'
import ExportButton from '@/components/ExportButton.vue'
import GithubSync from '@/components/GithubSync.vue'
import ImportUpload from '@/components/ImportUpload.vue'
import PageContent from '@/components/PageContent.vue'
import RenameSymbolModal from '@/components/RenameSymbolModal.vue'
import SymbolList from '@/components/SymbolList.vue'
import UserBubble from '@/components/UserBubble.vue'
import type { BinarySymbol } from '@/models/binary'
import type {
  CollabAnnotations,
  CollabBinaryAnalysisStatus,
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
import { cloneDeep, indexOf, isEqual, mapValues, uniq } from 'lodash'
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { VaIcon, VaInnerLoading } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
  binaryId?: string
  functionId?: string
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
  project.value?.binaries.find((binary) => binary.id === Number(props.binaryId))
)
const selectedSymbol = computed(() =>
  selectedBinary.value?.symbols.find((symbol) => symbol.functionId === Number(props.functionId))
)

const VirusTotalLink = computed(
  () => 'https://www.virustotal.com/gui/file/' + selectedBinary.value?.virustotalID
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
    params: { projectId: project.value!.id, binaryId: `${newValue}` }
  })
})

watch(selectedSymbol, () => {
  broadcastUserState(automergeDocumentHandle.value, {
    user: meStore.user,
    binaryID: selectedBinaryID.value,
    functionID: selectedSymbol.value?.functionId
  })
})

const analysisStatuses = ref<Record<number, CollabBinaryAnalysisStatus>>({})
const analysisStatus = computed(() =>
  selectedBinaryID.value ? analysisStatuses.value[selectedBinaryID.value] : undefined
)

const symbolOverrides = ref<CollabSymbolOverrides>({})
const bookmarkedAddresses = ref<CollabBookmarkedAddresses>([])
const annotations = ref<CollabAnnotations>({})

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
  const prevAnalysisStatuses = cloneDeep(analysisStatuses.value)
  const newAnalysisStatuses = mapValues(doc.binaries ?? {}, (binary) => binary.analysisStatus)

  if (selectedBinaryID.value) {
    analysisStatuses.value = newAnalysisStatuses

    const selectedBinaryData = doc.binaries?.[selectedBinaryID.value]
    if (selectedBinaryData) {
      symbolOverrides.value = selectedBinaryData.symbolOverrides ?? {}
      bookmarkedAddresses.value = selectedBinaryData.bookmarkedAddresses ?? []
      annotations.value = selectedBinaryData.annotations ?? {}
    }
  }

  if (!isEqual(prevAnalysisStatuses, newAnalysisStatuses)) {
    fetchProject()
  }

  broadcastUserState(automergeDocumentHandle.value, {
    user: meStore.user,
    binaryID: selectedBinaryID.value,
    functionID: selectedSymbol.value?.functionId
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

const statusText = computed(() => {
  switch (analysisStatus.value) {
    case 'complete':
      return 'analysis complete'
    case 'failed':
      return 'analysis failed; please try again, or report a bug'
    default:
      return 'analysis pending, please wait…'
  }
})
const statusColor = computed(() => {
  switch (analysisStatus.value) {
    case 'complete':
      return 'success'
    case 'failed':
      return 'danger'
    default:
      return 'primary'
  }
})

async function annotateLine(line: number, text: string | undefined) {
  if (!automergeDocumentHandle.value) return

  await automergeDocumentHandle.value.whenReady()
  automergeDocumentHandle.value.change((doc) => {
    if (selectedBinaryID.value) {
      doc.binaries ??= {}
      doc.binaries[selectedBinaryID.value] ??= {}
      doc.binaries[selectedBinaryID.value].annotations ??= {}
      doc.binaries[selectedBinaryID.value].annotations![props.functionId!] ??= {}

      if (text) {
        const prevUserIds =
          doc.binaries[selectedBinaryID.value].annotations![props.functionId!][line.toString()]
            ?.userIds ?? []
        doc.binaries[selectedBinaryID.value].annotations![props.functionId!][line.toString()] = {
          userIds: uniq([...prevUserIds, meStore.user!.id]),
          text
        }
      } else {
        delete doc.binaries[selectedBinaryID.value].annotations![props.functionId!][line.toString()]
      }
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
          <VaButton to="/projects" preset="primary" class="me-4">
            <VaIcon name="arrow_back" />
            <tippy target="_parent">return to projects</tippy>
          </VaButton>

          <h1 class="va-h6">
            {{ project.name }}
          </h1>

          <div class="ms-auto flex">
            <GithubSync :projectId="props.projectId" @complete="fetchProject" />
            <ExportButton :projectId="props.projectId" @complete="fetchProject" class="ms-4" />
            <ImportUpload :projectId="props.projectId" @complete="fetchProject" class="ms-4" />
            <BinaryUpload :projectId="props.projectId" @complete="fetchProject" class="ms-4" />
          </div>
        </div>

        <VaTabs v-model="selectedBinaryID" class="project-view-main-tabs items-start">
          <template #tabs>
            <VaTab v-for="binary in project.binaries" :key="binary.id" :name="binary.id">
              <span class="me-1">{{ binary.name }}</span>
              <VaInnerLoading
                v-if="!analysisStatuses[binary.id]"
                loading
                :size="20"
                class="ms-2 inline-block"
              />
              <template v-else>
                <UserBubble
                  v-for="userState in userStates.filter((state) => state.binaryID === binary.id)"
                  :key="userState.user!.id"
                  :user="userState.user!"
                  class="ms-1"
                />
              </template>
            </VaTab>
          </template>
          <div class="ms-4 mt-4 flex items-center text-sm font-semibold" v-if="selectedBinary">
            <div class="pb-1">
              status: <span :style="{ color: `var(--va-${statusColor})` }">{{ statusText }}</span>
            </div>
            <template v-if="selectedBinary?.virustotalID">
              <a :href="`${VirusTotalLink}`" target="_blank" rel="noreferrer" class="ms-4 pb-1">
                <VaButton preset="primary" size="small">
                  VirusTotal analysis
                  <VaIcon name="launch" />
                </VaButton>
              </a>
            </template>
          </div>

          <VaInnerLoading
            v-if="selectedBinary"
            :loading="!analysisStatus"
            class="flex flex-wrap py-4 md:flex-nowrap"
          >
            <template v-if="selectedBinary">
              <div class="flex w-full flex-col items-stretch gap-2 p-4 md:w-4/12">
                <h2 class="va-h6">symbols</h2>

                <div class="flex flex-col">
                  <div class="pb-1">
                    <div
                      class="h-[27vh] overflow-auto rounded-sm border-2 border-solid border-primary p-2"
                    >
                      <SymbolList
                        :projectId="project.id"
                        :binaryId="selectedBinary.id"
                        :symbols="bookmarkedSymbols"
                        :selectedSymbol="selectedSymbol"
                        :overrides="symbolOverrides ?? {}"
                        :userStates="userStates"
                        isBookmarkList
                        @bookmark="toggleSymbolBookmarked"
                        @rename="showRenameSymbol"
                      />
                    </div>
                  </div>

                  <div class="pt-1">
                    <div
                      class="h-[39.04vh] overflow-auto rounded-sm border-2 border-solid border-primary p-2"
                    >
                      <SymbolList
                        :projectId="project.id"
                        :binaryId="selectedBinary.id"
                        :symbols="nonBookmarkedSymbols"
                        :selectedSymbol="selectedSymbol"
                        :overrides="symbolOverrides ?? {}"
                        :userStates="userStates"
                        @bookmark="toggleSymbolBookmarked"
                        @rename="showRenameSymbol"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex w-full flex-1 flex-col gap-2 p-4 md:w-8/12">
                <h2 class="va-h6">disassembly</h2>

                <DisassemblyListing
                  :project="project"
                  :functionId="functionId"
                  :annotations="annotations"
                  @annotate="annotateLine"
                />
              </div>
            </template>
          </VaInnerLoading>
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
</style>
