<script setup lang="ts">
import type { User } from '@/models/user'
import UserBubble from './UserBubble.vue'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/material.css'

defineProps<{
  text: string
  users: User[]
}>()

defineEmits<{
  delete: []
}>()
</script>

<template>
  <div class="inline-comment va-typography-block text-sm">
    <span
      ><UserBubble v-for="user in users" :user="user" :key="user.id" class="me-2" />
      <i>{{ users.length === 0 ? '' : users.length === 1 ? 'says…' : 'say…' }}</i></span
    >
    <p class="m-0 mt-2 whitespace-pre text-sm">{{ text }}</p>
  </div>
</template>

<style scoped>
.inline-comment {
  margin-left: 1em;
  padding: 0.5em;
  padding-left: 0.75em;

  background: #fff;
  border: 2px solid #000;
  border-radius: 0.5em;
}
</style>
