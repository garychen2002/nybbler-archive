import type { PaginatedResponse } from '@/models/paginated'
import type { Project } from '@/models/project'
import { signIn } from '@/services/auth'
import { keyBy } from 'lodash'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiProjects } from '../services/api'

export const useProjectsStore = defineStore('projects', () => {
  const initialized = ref(false)

  const projects = ref<Project[]>([])
  const projectsByID = ref<Record<string, Project>>({})
  const olderID = ref<number>()

  // https://pinia.vuejs.org/core-concepts/actions.html
  async function init() {
    // TODO: move this
    await signIn('alice@example.com')

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
    await apiProjects.patch(project.id, project)
    await fetchList()
  }
  async function delete_({ id }: Project) {
    await apiProjects.delete(id)
    await fetchList()
  }

  const exports = { initialized, projects, projectsByID, init, create, update, delete: delete_ }

  async function fetchList() {
    const page = await apiProjects.get<PaginatedResponse<Project>>({
      query: {
        before: olderID,
        limit: 10
      }
    })

    projects.value = page.items
    olderID.value = page.older?.id

    projectsByID.value = keyBy(projects.value, ({ id }) => id)
  }

  return exports
})
