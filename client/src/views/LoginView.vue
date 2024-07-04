<script setup lang="ts">
import { useRouter } from 'vue-router';

const name = defineModel('name');
const email = defineModel('email');

const router = useRouter();

const submit = (event: Event) => {
  event.preventDefault();

  try {
    fetch('/api/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Login request failed');
      }

      const data = response.json();
    }).then((res) => {
      router.push({
        name: 'projects'
      })
    }
    );


  } catch (error) {
    console.error('Error:', error);
  }
};
</script>

<template>
  <div class="w-4/12">
    <h3 class="va-h3">Temporary User Login</h3>
    <form>
      <div class="va-form-group mb-4">
        <label class="va-body-1 mb-2 mr-2" for="name">Name:</label>
        <input class="va-input" v-model="name" placeholder="Name">
      </div>

      <div class="va-form-group mb-4">
        <label class="va-body-1 mb-2 mr-2" for="email">Email:</label>
        <input class="va-input" v-model="email" placeholder="Email" equired>
      </div>

      <button @click="submit" class="va-button va-button--primary" type="submit">Submit</button>
    </form>
  </div>
</template>
