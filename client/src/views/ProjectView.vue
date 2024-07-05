<script setup lang="ts">
import DisassemblyListing from '@/components/DisassemblyListing.vue'
import FileUpload from '@/components/FileUpload.vue'
import type { Project } from '@/models/project'
import { apiProjects } from '@/services/api'
import { signIn } from '@/services/auth'
import { computed, ref, watch, watchEffect } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { VaInnerLoading, VaListItem } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
  binaryId?: string
  address?: string
}>()

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
                <VaList class="h-full overflow-auto text-xs">
                  <VaListItem
                    v-for="symbol in selectedBinary.symbols"
                    :key="symbol.name"
                    :to="{
                      name: 'project-binary-address',
                      params: {
                        projectId: project.id,
                        binaryId: selectedBinary.id,
                        address: symbol.address
                      }
                    }"
                    class="va-link m-1 rounded p-1"
                    :class="{
                      'selected-symbol': symbol.address === selectedSymbol?.address
                    }"
                  >
                    <span class="font-mono">{{ symbol.name }}</span>
                  </VaListItem>
                </VaList>
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
  </VaInnerLoading>
</template>

<style scoped>
.selected-symbol {
  background-color: #dee5f2 !important;
}
</style>
