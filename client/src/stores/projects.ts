import type { PaginatedResponse } from '@/models/paginated'
import type { ProjectMetadata } from '@/models/project_metadata'
import { keyBy } from 'lodash'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiProjects } from '../services/api'

export const useProjectsStore = defineStore('projects', () => {
  const initialized = ref(false)

  const projects = ref<ProjectMetadata[]>([])
  const projectsByID = ref<Record<string, ProjectMetadata>>({})
  const olderID = ref<number>()

  // https://pinia.vuejs.org/core-concepts/actions.html
  async function init() {
    if (!initialized.value) {
      fetchList()
      initialized.value = true
    }
  }
  async function reinit() {
    initialized.value = false
    init()
  }
  async function create(name: string) {
    await apiProjects.post<ProjectMetadata>({ name })
    await fetchList()
  }
  async function update(project: ProjectMetadata) {
    await apiProjects.patch(project.id, project)
    await fetchList()
  }
  async function invite({ id }: ProjectMetadata, userIds: number[]) {
    await apiProjects.post(`${id}/invitees`, {
      userIds
    })
  }
  async function leave({ id }: ProjectMetadata) {
    await apiProjects.delete(id)
    await fetchList()
  }

  const exports = {
    initialized,
    projects,
    projectsByID,
    init,
    reinit,
    create,
    update,
    invite,
    leave
  }

  async function fetchList() {
    const page = await apiProjects.get<PaginatedResponse<ProjectMetadata>>({
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
