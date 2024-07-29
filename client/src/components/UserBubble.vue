<script setup lang="ts">
import type { User } from '@/models/user'
import Color from 'color'
import { computed } from 'vue'

const props = defineProps<{
  user: User
  borderColor?: string
}>()

// https://stackoverflow.com/a/66494926
function hashStringToColor(str: string) {
  let stringUniqueHash = [...str].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return `hsl(${stringUniqueHash % 360}, 90%, 60%)`
}

const backgroundColor = computed(() => hashStringToColor(props.user.username))
const color = computed(() => (Color(backgroundColor.value).isLight() ? '#000' : '#fff'))
</script>

<template>
  <div
    class="user-bubble"
    :style="{
      borderColor,
      backgroundColor
    }"
  >
    <span :style="{ color }">{{ user.name[0].toLocaleUpperCase() }}</span>
    <tippy target="_parent">{{ user.name }} ({{ user.username }})</tippy>
  </div>
</template>

<style scoped>
/* https://www.w3schools.com/howto/howto_css_circles.asp */
.user-bubble {
  height: 1.6em;
  width: 1.6em;

  display: inline-flex;
  justify-content: center;
  align-items: center;

  border: 2px solid;
  border-radius: 50%;
}
</style>
