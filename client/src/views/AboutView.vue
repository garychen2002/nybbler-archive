<script setup lang="ts">
import HomepageFooter from '@/components/HomepageFooter.vue'
import PageContent from '@/components/PageContent.vue'
import { shuffle } from 'lodash'
</script>

<template>
  <PageContent>
    <div class="w-full md:w-8/12 xl:w-4/12">
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
        <li><a class="va-link" href="https://expressjs.com/">Express</a></li>
        <li><a class="va-link" href="https://sequelize.org/">Sequelize</a></li>
        <li><a class="va-link" href="https://ghidra-sre.org/">Ghidra</a></li>
        <li>Java Runtime and Development Kit 17 / OpenJDK 17</li>
        <li>
          <a class="va-link" href="https://github.com/decompiler-explorer/decompiler-explorer"
            >Decompiler Explorer</a
          >
          (inspiration +
          <a
            class="va-link"
            href="https://github.com/decompiler-explorer/decompiler-explorer/blob/master/runners/decompiler/tools/ghidra/DecompilerExplorer.java"
            >reference for decompilation output script</a
          >)
        </li>
        <li>
          <a class="va-link" href="https://ben.page/node-spawn-callback"
            >spawn function callback reference</a
          >
        </li>
      </ul>
    </div>
  </PageContent>

  <HomepageFooter />
</template>
