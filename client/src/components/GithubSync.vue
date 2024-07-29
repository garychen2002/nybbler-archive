<script setup lang="ts">
import { apiProjects, apiUsers } from '@/services/api'
import { onMounted, ref } from 'vue'
import { useToast, VaButton, VaIcon, VaSelect } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
}>()

const selectedRepo = ref(null)
const selectedBranch = ref(null)
const ownerRef = ref()
const repos = ref([])
const branches = ref([])
const showModal = ref(false)

const toast = useToast()

async function fetchOwner() {
  try {
    const res = await apiUsers.get('/me', { responseAs: 'response' })
    const data = await res.json()
    ownerRef.value = data.username
    fetchRepos()
  } catch (error) {
    console.error('Error fetching user data:', error)
  }
}

async function fetchRepos() {
  try {
    const res = await apiUsers.get('/repos', { responseAs: 'response' })
    const data = await res.json()
    repos.value = data.map((repo: any) => repo.name)
  } catch (error) {
    console.error('Failed to fetch repos:', error)
  }
}

async function fetchBranches(repo: string) {
  try {
    const owner = ownerRef.value
    const res = await apiUsers.get(`/branches?owner=${owner}&repo=${repo}`, {
      responseAs: 'response'
    })
    const data = await res.json()
    branches.value = data.map((branch: any) => branch.name)
  } catch (error) {
    console.error('Failed to fetch branches:', error)
  }
}

async function syncProject() {
  if (!selectedRepo.value || !selectedBranch.value) {
    toast.notify({
      message: 'Please select both a repository and a branch.',
      color: 'warning'
    })
    return
  }

  showModal.value = false

  const toastID = toast.init({ message: `Syncing project to GitHub...`, duration: -1 })
  try {
    await apiProjects.post(`/${props.projectId}/sync-to-github`, {
      projectId: props.projectId,
      owner: ownerRef.value,
      repo: selectedRepo.value,
      branch: selectedBranch.value,
      filePath: 'nybbler.zip'
    })
    toast.notify({ message: `Project synced to GitHub.`, color: 'success' })
  } catch (error) {
    toast.notify({
      message: `Failed to sync project to GitHub.`,
      color: 'danger'
    })
    console.error(error)
  } finally {
    toast.close(toastID!)
  }
}

async function loadProject() {
  if (!selectedRepo.value || !selectedBranch.value) {
    toast.notify({
      message: 'Please select both a repository and a branch.',
      color: 'warning'
    })
    return
  }

  showModal.value = false

  const toastID = toast.init({ message: `Loading project from GitHub...`, duration: -1 })
  try {
    await apiProjects.post(`/${props.projectId}/load-from-github`, {
      projectId: props.projectId,
      owner: ownerRef.value,
      repo: selectedRepo.value,
      branch: selectedBranch.value,
      filePath: 'nybbler.zip'
    })
    toast.notify({ message: `Project loaded from GitHub.`, color: 'success' })
  } catch (error) {
    toast.notify({
      message: `Failed to load project from GitHub.`,
      color: 'danger'
    })
    console.error(error)
  } finally {
    toast.close(toastID!)
  }
}

onMounted(() => {
  fetchOwner()
})
</script>

<template>
  <VaButton v-bind="$attrs" @click="showModal = !showModal" preset="primary" class="ms-4">
    GitHub sync
    <VaIcon name="sync" class="ms-2" />
  </VaButton>

  <VaModal v-model="showModal" size="small" hide-default-actions>
    <h3 class="va-h6 mb-4">sync with GitHub</h3>

    <p class="my-2">
      you must
      <a href="https://github.com/apps/nybbler-me/installations/new" target="_blank" class="va-link"
        >install nybbler.me as a GitHub app <VaIcon name="open_in_new"
      /></a>
      to use this feature. the repository must live on your personal account and be public, and the
      target branch must already exist.
    </p>

    <VaSelect
      v-model="selectedRepo"
      :options="repos"
      label="select repository"
      searchable
      highlight-matched-text
      no-options-text="no such repositories"
      class="w-full"
      @update:modelValue="fetchBranches"
    />
    <div :style="{ marginTop: '0.5rem' }"></div>
    <VaSelect
      v-model="selectedBranch"
      :options="branches"
      label="select branch"
      searchable
      highlight-matched-text
      no-options-text="no such branches"
      class="w-full"
    />

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (showModal = false)">
        cancel
      </VaButton>
      <VaButton v-bind="$attrs" @click="syncProject" preset="primary" class="ms-4">
        commit
        <VaIcon name="upload" class="ms-2" />
      </VaButton>
      <VaButton v-bind="$attrs" @click="loadProject" preset="primary" class="ms-4">
        pull
        <VaIcon name="download" class="ms-2" />
      </VaButton>
    </template>
  </VaModal>
</template>
