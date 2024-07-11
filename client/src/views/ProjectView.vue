<script setup lang="ts">
import DisassemblyListing from '@/components/DisassemblyListing.vue'
import FileUpload from '@/components/FileUpload.vue'
import RenameSymbolModal from '@/components/RenameSymbolModal.vue'
import SymbolList from '@/components/SymbolList.vue'
import type { BinarySymbol } from '@/models/binaries/binary'
import type { CollabProject, CollabSymbolOverrides } from '@/models/collab'
import type { Project } from '@/models/project'
import { apiProjects } from '@/services/api'
import { repo } from '@/services/automerge'
import { computed, ref, watch, watchEffect } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { VaInnerLoading } from 'vuestic-ui'

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

const symbolOverrides = ref<CollabSymbolOverrides>()
const automergeDocumentHandle = computed(() =>
  project.value ? repo.find<CollabProject>(project.value.automergeDocumentId) : undefined
)
watch(automergeDocumentHandle, () => {
  automergeDocumentHandle.value?.on('change', ({ doc }) => {
    if (selectedBinaryID.value) {
      symbolOverrides.value = doc.binaries?.[selectedBinaryID.value].symbolOverrides
    }
  })
})

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
}
</script>

<template>
  <VaInnerLoading :loading="!project">
    <div class="w-full" v-if="project">
      <div class="mb-4 flex">
        <h1 class="va-h6">
          {{ project.name }}
        </h1>
        <FileUpload :projectId="props.projectId" />
      </div>

      <VaTabs v-model="selectedBinaryID" class="items-start">
        <template #tabs>
          <VaTab v-for="binary in project.binaries" :key="binary.id" :name="binary.id">
            {{ binary.name }}
          </VaTab>
        </template>

        <VaLayout v-if="selectedBinary" class="mt-4">
          <template #left>
            <div class="flex flex-col gap-2 p-4">
              <h2 class="va-h6">symbols</h2>

              <div class="h-[55vh] rounded-sm border-2 border-solid border-primary p-2">
                <SymbolList
                  :projectId="project.id"
                  :binaryId="selectedBinary.id"
                  :symbols="selectedBinary.symbols"
                  :selectedSymbol="selectedSymbol"
                  :symbolOverrides="symbolOverrides ?? {}"
                  @rename="showRenameSymbol"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div class="flex flex-col gap-2 p-4">
              <h2 class="va-h6">disassembly</h2>

              <DisassemblyListing :project="project" :binary="selectedBinary" :address="address" />
            </div>
          </template>
        </VaLayout>
      </VaTabs>
    </div>

    <RenameSymbolModal
      :show="showRenameSymbolModal"
      :currentName="symbolToRename?.name"
      @submit="submitRenameSymbol"
    />
  </VaInnerLoading>
</template>
