import type { PaginatedResponse } from '@/models/paginated'
import type { User } from '@/models/user'
import { keyBy } from 'lodash'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiUsers } from '../services/api'

export const useUsersStore = defineStore('users', () => {
  const initialized = ref(false)

  const users = ref<User[]>([])
  const usersByID = ref<Record<string, User>>({})

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

  const exports = { initialized, users, usersByID, init, reinit }

  async function fetchList() {
    const page = await apiUsers.get<PaginatedResponse<User>>()
    users.value = page.items

    usersByID.value = keyBy(users.value, ({ id }) => id)
  }

  return exports
})
