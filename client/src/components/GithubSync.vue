<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiUsers, apiProjects } from '@/services/api'
import { useToast, VaButton, VaIcon, VaSelect } from 'vuestic-ui'

const props = defineProps<{
  projectId: string
}>()

const selectedRepo = ref(null)
const selectedBranch = ref(null)
const ownerRef = ref()
const repos = ref([])
const branches = ref([])

const toast = useToast()

async function fetchOwner() {
  try {
    const res = await apiUsers.get('/me', { responseAs: 'response' });
    const data = await res.json();
    ownerRef.value = data.username;
    fetchRepos()
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}

async function fetchRepos() {
  try {
    const res = await apiUsers.get('/repos', { responseAs: 'response' });
    const data = await res.json();
    repos.value = data.map((repo: any) => (repo.name))
  } catch (error) {
    console.error('Failed to fetch repos:', error)
  }
}

async function fetchBranches(repo: string) {
  try {
    const owner = ownerRef.value;
    const res = await apiUsers.get(`/branches?owner=${owner}&repo=${repo}`, { responseAs: 'response' })
    const data = await res.json();
    branches.value = data.map((branch: any) => (branch.name))
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

  const toastID = toast.init({ message: `Syncing project to GitHub...`, duration: -1 })
  try {
    await apiProjects.post(`/${props.projectId}/sync-to-github`, {
      projectId: props.projectId,
      owner: ownerRef.value,
      repo: selectedRepo.value,
      branch: selectedBranch.value,
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

  const toastID = toast.init({ message: `Loading project from GitHub...`, duration: -1 })
  try {
    await apiProjects.post(`/${props.projectId}/load-from-github`, {
      projectId: props.projectId,
      owner: ownerRef.value,
      repo: selectedRepo.value,
      branch: selectedBranch.value,
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
  <div>
    <VaSelect v-model="selectedRepo" :options="repos" label="Select Repository" class="ms-4"
      @update:modelValue="fetchBranches" />
    <VaSelect v-model="selectedBranch" :options="branches" label="Select Branch" class="ms-4" />
    <VaButton v-bind="$attrs" @click="syncProject" preset="primary" class="ms-4">
      Sync to GitHub
      <VaIcon name="upload" class="ms-2" />
    </VaButton>
    <VaButton v-bind="$attrs" @click="loadProject" preset="secondary" class="ms-4">
      Load from GitHub
      <VaIcon name="download" class="ms-2" />
    </VaButton>
  </div>
</template>