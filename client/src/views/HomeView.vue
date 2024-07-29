<script setup lang="ts">
import HomepageFooter from '@/components/HomepageFooter.vue'
import PageContent from '@/components/PageContent.vue'
</script>

<template>
  <PageContent>
    <div class="flex flex-col text-center">
      <div class="my-auto">
        <h1 class="va-h1">nybbler</h1>
        <h2 class="va-h2">your sre workspace</h2>

        <p class="mt-8 text-xl">
          <span class="inline-block">nybbler is a real-time collaborative workspace</span
          >&nbsp;<span class="inline-block">for software reverse engineering.</span>
        </p>
        <p class="mt-2 text-xl">upload, analyze, understand. together.</p>
      </div>

      <div class="mb-4 mt-auto">get started</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2em"
        height="2em"
        viewBox="0 0 1024 1024"
        class="arrow-hover-anim z-40 mx-auto"
      >
        <path
          fill="currentColor"
          d="M8.2 275.4c0-8.6 3.4-17.401 10-24.001c13.2-13.2 34.8-13.2 48 0l451.8 451.8l445.2-445.2c13.2-13.2 34.8-13.2 48 0s13.2 34.8 0 48L542 775.399c-13.2 13.2-34.8 13.2-48 0l-475.8-475.8c-6.8-6.8-10-15.4-10-24.199"
        />
      </svg>
    </div>
  </PageContent>

  <HomepageFooter />
</template>

<style scoped>
.arrow-hover-anim {
  animation: arrow-hover 0.6s ease-in alternate infinite;
}

@keyframes arrow-hover {
  0% {
    transform: translateY(4px);
  }
  100% {
    transform: translateY(16px);
  }
}
</style>
