import type { PaginatedResponse } from '@/models/paginated'
import type { User } from '@/models/user'
import { signIn } from '@/services/auth'
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
    // TODO: move this
    await signIn('alice@example.com')

    if (!initialized.value) {
      fetchList()
      initialized.value = true
    }
  }

  const exports = { initialized, users, usersByID, init }

  async function fetchList() {
    const page = await apiUsers.get<PaginatedResponse<User>>()
    users.value = page.items

    usersByID.value = keyBy(users.value, ({ id }) => id)
  }

  return exports
})
