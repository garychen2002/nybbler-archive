<script setup lang="ts">
import { auth } from '@/services/api'
import { signIn } from '@/services/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref<string>('')
const email = ref<string>('')

const router = useRouter()

const submit = async (event: Event) => {
  event.preventDefault()

  await auth.post('/signup', {
    name: name.value,
    email: email.value
  })
  await signIn(email.value)

  router.push({ name: 'projects' })
}
</script>

<template>
  <div class="w-4/12">
    <h3 class="va-h3">Temporary User Login</h3>
    <form>
      <div class="va-form-group mb-4">
        <label class="va-body-1 mb-2 mr-2" for="name">Name:</label>
        <input class="va-input" v-model="name" placeholder="Name" />
      </div>

      <div class="va-form-group mb-4">
        <label class="va-body-1 mb-2 mr-2" for="email">Email:</label>
        <input class="va-input" v-model="email" placeholder="Email" equired />
      </div>

      <button @click="submit" class="va-button va-button--primary" type="submit">Submit</button>
    </form>
  </div>
</template>
