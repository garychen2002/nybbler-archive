<script setup lang="ts">
import DisassemblyListing from '@/components/DisassemblyListing.vue'
import FileUpload from '@/components/FileUpload.vue'
import type { Project } from '@/models/project'
import { apiProjects } from '@/services/api'
import { signIn } from '@/services/auth'
import { useProjectsStore } from '@/stores/projects'
import { computed, ref, watch, watchEffect } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { VaInnerLoading } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
  binaryId: string
  symbolName: string
}>()

const projectsStore = useProjectsStore()
watchEffect(async () => {
  await projectsStore.init()
})

const project = ref<Project>()
async function fetchProject() {
  // TODO: remove this
  await signIn('alice@example.com')

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

const binary = computed(() =>
  project.value?.binaries.find((binary) => `${binary.id}` === props.binaryId)
)
const symbol = computed(() =>
  binary.value?.symbols.find((symbol) => symbol.name === props.symbolName)
)

const router = useRouter()

// Default binary selection
watchEffect(() => {
  if (!binary.value) {
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
</script>

<template>
  <VaInnerLoading :loading="!project">
    <div class="w-full" v-if="project">
      <h1 class="va-h6">
        {{ project.name }}
      </h1>
      <FileUpload :projectId="props.projectId" />
      <VaTabs v-model="selectedBinaryID" class="items-start">
        <template #tabs>
          <VaTab v-for="binary in project.binaries" :key="binary.id" :name="binary.id">
            {{ binary.name }}
          </VaTab>
        </template>

        <VaLayout v-if="binary" class="mt-4">
          <template #left>
            <div class="flex flex-col gap-2 p-4">
              <h2 class="va-h6">Symbols</h2>

              <VaList class="h-64 flex-grow overflow-auto">
                <VaListItem
                  v-for="symbol in binary.symbols"
                  :key="symbol.name"
                  :to="{
                    name: 'project-binary-symbol',
                    params: { projectId: project.id, binaryId: binary.id, symbolName: symbol.name }
                  }"
                  class="va-link"
                >
                  {{ symbol.name }}
                </VaListItem>
              </VaList>
            </div>
          </template>

          <template #content>
            <div class="flex flex-col gap-2 p-4">
              <h2 class="va-h6">Disassembly</h2>

              <DisassemblyListing :project="project" :binary="binary" :symbol="symbol" />
            </div>
          </template>
        </VaLayout>
      </VaTabs>
    </div>
  </VaInnerLoading>
</template>
