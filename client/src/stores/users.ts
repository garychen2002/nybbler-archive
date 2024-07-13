import type { PaginatedResponse } from '@/models/paginated'
import type { User } from '@/models/user'
import { keyBy } from 'lodash'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiUsers } from '../services/api'
import { useInitializeStore } from './_util'

export const useUsersStore = defineStore('users', () => {
  const { initialized, init, reinit } = useInitializeStore(fetchList)

  const users = ref<User[]>([])
  const usersByID = ref<Record<string, User>>({})

  const exports = { initialized, users, usersByID, init, reinit }

  async function fetchList() {
    const page = await apiUsers.get<PaginatedResponse<User>>()
    users.value = page.items

    usersByID.value = keyBy(users.value, ({ id }) => id)
  }

  return exports
})
