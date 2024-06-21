<script setup lang="ts">
import { shuffle } from 'lodash'
</script>

<template>
  <h2 class="va-h2">credits</h2>

  <h3 class="va-h3 mb-2">team</h3>
  <ul class="va-unordered ms-6">
    <li v-for="name in shuffle(['Ian Gregory', 'Gary Chen', 'Martin Loo'])" :key="name">
      {{ name }}
    </li>
  </ul>

  <h3 class="va-h3 mb-2 mt-4">tech</h3>
  <ul class="va-unordered ms-6">
    <li><a class="va-link" href="https://vuejs.org">Vue</a></li>
    <li><a class="va-link" href="https://vitejs.dev/">Vite</a></li>
    <li><a class="va-link" href="https://www.typescriptlang.org/">TypeScript</a></li>
    <li><a class="va-link" href="https://ui.vuestic.dev/">Vuestic UI</a></li>
    <li><a class="va-link" href="https://tailwindcss.com/">Tailwind CSS</a></li>
    <li><a class="va-link" href="https://github.com/posva/mande">mande</a></li>
    <li><a class="va-link" href="https://lodash.com/">Lodash</a></li>
    <li>... add backend tech here ...</li>
  </ul>
</template>
