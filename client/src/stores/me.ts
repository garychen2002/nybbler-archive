import { apiUsers } from '@/services/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../models/user'
import { useInitializeStore } from './_util'

export const useMeStore = defineStore('me', () => {
  const { initialized, init, reinit } = useInitializeStore(fetchItem)

  const user = ref<User>()

  async function fetchItem() {
    user.value = await apiUsers.get<User>('/me')
  }

  return { initialized, user, init, reinit }
})
