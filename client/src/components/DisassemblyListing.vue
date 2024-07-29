<script setup lang="ts">
import '@/components/InlineComment.vue'
import InlineComment from '@/components/InlineComment.vue'
import type { CollabAnnotations } from '@/models/collab'
import { fetchFunction, type Function } from '@/models/function'
import type { Project } from '@/models/project'
import { useUsersStore } from '@/stores/users'
import * as monaco from 'monaco-editor'
import MonacoEditor from 'monaco-editor-vue3'
import { TippyPlugin } from 'tippy.vue'
import { computed, createApp, onMounted, ref, watch } from 'vue'
import { createVuesticEssential, VaInnerLoading } from 'vuestic-ui'
import EditInlineCommentModal from './EditInlineCommentModal.vue'
import './syntax_highlight_langs'

const props = defineProps<{
  project: Project
  functionId?: string
  annotations?: CollabAnnotations
}>()

const emit = defineEmits<{
  annotate: [line: number, text: string | undefined]
}>()

async function fetchCurrentFunction() {
  const functionId = Number(props.functionId)
  if (functionId) {
    function_.value = undefined
    function_.value = await fetchFunction(functionId)
  } else {
    function_.value = null
  }
}

const function_ = ref<Function | null | undefined>(null)
watch([() => props.functionId], fetchCurrentFunction)

const usersStore = useUsersStore()

onMounted(async () => {
  await fetchCurrentFunction()
  await usersStore.init()
})

const functionAnnotations = computed(() => props.annotations?.[props.functionId ?? ''] ?? {})

let editor: monaco.editor.IStandaloneCodeEditor | undefined
let zoneIDs: string[] = []

async function addAnnotationsToEditor() {
  const commentDomEls: { line: string; el: HTMLElement; height: number }[] = await Promise.all(
    Object.entries(functionAnnotations.value).map(async ([line, { userIds, text }]) => {
      const users = (userIds ?? []).map((userId) => usersStore.usersByID[userId])

      const subapp = createApp(InlineComment, { users, text })
      subapp.use(createVuesticEssential())
      subapp.use(TippyPlugin, {
        tippyDefaults: {
          arrow: false,
          theme: 'material'
        }
      })

      const el = document.createElement('div')
      const vm = subapp.mount(el)

      await vm.$nextTick()

      // Bit of a hack to get the height of the element
      const clone = el.cloneNode(true) as HTMLElement
      clone.classList.add('invisible')
      document.body.append(clone)
      const height = clone.clientHeight
      clone.remove()

      return { line, el, height }
    })
  )

  editor?.changeViewZones(async (changeAccessor) => {
    zoneIDs.forEach((zoneID) => {
      changeAccessor.removeZone(zoneID)
    })

    zoneIDs = commentDomEls.map(({ line, el, height }) => {
      return changeAccessor.addZone({
        afterLineNumber: Number(line),
        heightInPx: height,
        domNode: el
      })
    })
  })
}

async function editorDidMount(editor_: monaco.editor.IStandaloneCodeEditor) {
  editor = editor_

  editor.onMouseUp((event) => {
    const lineNumber = event.target.position?.lineNumber
    if (!lineNumber) return

    editInlineCommentLineNumber.value = lineNumber
    editInlineCommentExistingText.value = functionAnnotations.value[lineNumber.toString()]?.text
    showEditInlineCommentModal.value = true
  })

  editor.onDidDispose(() => {
    editor = undefined
  })

  await usersStore.init()
  await addAnnotationsToEditor()
}

watch(functionAnnotations, addAnnotationsToEditor)

const editInlineCommentLineNumber = ref<number>()
const editInlineCommentExistingText = ref<string>()
const showEditInlineCommentModal = ref(false)

function submitEditInlineComment(text: string | undefined) {
  emit('annotate', editInlineCommentLineNumber.value!, text)
}
</script>

<template>
  <VaInnerLoading
    :loading="function_ === undefined"
    class="h-full rounded-sm border-2 border-solid border-primary p-2"
  >
    <MonacoEditor
      v-if="function_"
      language="x86asm"
      theme="nybbler"
      :value="function_.disassembly"
      :options="{
        readOnly: true,
        domReadOnly: true,
        lineHeight: 1.75,
        minimap: { enabled: false },
        automaticLayout: true
      }"
      @editorDidMount="editorDidMount"
    />
  </VaInnerLoading>

  <EditInlineCommentModal
    v-model:show="showEditInlineCommentModal"
    :existingText="editInlineCommentExistingText"
    @submit="submitEditInlineComment"
  />
</template>

<style scoped>
:deep(.view-line) {
  cursor: pointer;
}

:deep(.view-line:hover) {
  background: rgb(255, 255, 179);
}
</style>
