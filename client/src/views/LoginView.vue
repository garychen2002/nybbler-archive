<script setup lang="ts">
import HomepageFooter from '@/components/HomepageFooter.vue'
import PageContent from '@/components/PageContent.vue'
import { auth } from '@/services/api'
import { signIn } from '@/services/auth'
import { useProjectsStore } from '@/stores/projects'
import { useUsersStore } from '@/stores/users'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref<string>('')
const email = ref<string>('')

const router = useRouter()

const stores = [useProjectsStore(), useUsersStore()]

const submit = async (event: Event) => {
  event.preventDefault()

  await auth.post('/signup', {
    name: name.value,
    email: email.value
  })
  await signIn(email.value)

  stores.forEach((store) => store.reinit())

  router.push({ name: 'projects' })
}
</script>

<template>
  <PageContent>
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
  </PageContent>

  <HomepageFooter />
</template>
