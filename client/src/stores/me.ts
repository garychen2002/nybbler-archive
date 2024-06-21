import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../models'

export const useMeStore = defineStore('me', () => {
  const user = ref<User>()

  return { user }
})
