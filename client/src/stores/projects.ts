import type { Project } from '@/models/project'
import { keyBy } from 'lodash'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiProjects } from '../api'

export const useProjectsStore = defineStore('projects', () => {
  const initialized = ref(false)

  const projects = ref<Project[]>([])
  const projectsByID = ref<Record<string, Project>>({})

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

  const exports = { initialized, projects, projectsByID, init, create, update, delete: delete_ }

  async function fetchList() {
    // projects.value = await apiProjects.get<Project[]>()
    projects.value = [
      {
        id: 1,
        name: 'First Project',
        invitees: [
          {
            id: 1,
            name: 'Ian',
            email: 'ian@example.com'
          }
        ],
        binaries: [
          {
            id: 1,
            name: 'some_binary.exe',
            symbols: [
              { name: '_main', address: 100 },
              { name: '_helper', address: 200 }
            ],
            disassembly: ''
          },
          {
            id: 2,
            name: 'library.dll',
            symbols: [
              { name: '_lib1', address: 150 },
              { name: '_lib2', address: 250 }
            ],
            disassembly: ''
          }
        ]
      },
      {
        id: 2,
        name: 'Second Project',
        invitees: [],
        binaries: [
          {
            id: 3,
            name: 'another_binary.exe',
            symbols: [
              { name: '_main', address: 100 },
              { name: '_helper', address: 200 }
            ],
            disassembly: ''
          }
        ]
      }
    ] satisfies Project[]
    projectsByID.value = keyBy(projects.value, ({ id }) => id)
  }

  return exports
})
