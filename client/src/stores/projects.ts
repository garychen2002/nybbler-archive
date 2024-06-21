import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiProjects } from '../api'
import type { Project } from '../models'

export const useProjectsStore = defineStore('projects', () => {
  const initialized = ref(false)
  const projects = ref<Project[]>([])

  // https://pinia.vuejs.org/core-concepts/actions.html
  async function init() {
    if (!initialized.value) {
      fetchList()
      initialized.value = true
    }
  }
  async function create(name: string) {
    await apiProjects.post<Project>({ name })
    await fetchList()
  }
  async function update(project: Project) {
    apiProjects.patch(project.id, project)
    await fetchList()
  }
  async function delete_({ id }: Project) {
    apiProjects.delete(id)
    await fetchList()
  }

  const exports = { initialized, projects, init, create, update, delete: delete_ }

  async function fetchList() {
    // projects.value = await apiProjects.get<Project[]>()
    projects.value = [
      {
        id: 1,
        name: 'First Project',
        invitees: [1]
      },
      {
        id: 2,
        name: 'Second Project',
        invitees: [1]
      }
    ]
  }

  return exports
})
