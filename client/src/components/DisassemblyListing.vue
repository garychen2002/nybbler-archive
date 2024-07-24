<script setup lang="ts">
import type { CollabAnnotations } from '@/models/collab'
import { fetchFunction, type Function } from '@/models/function'
import type { Project } from '@/models/project'
import * as monaco from 'monaco-editor'
import MonacoEditor from 'monaco-editor-vue3'
import { computed, onMounted, ref, watch } from 'vue'
import { VaInnerLoading } from 'vuestic-ui'
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

onMounted(async () => {
  await fetchCurrentFunction()
})

const functionAnnotations = computed(() => props.annotations?.[props.functionId ?? ''] ?? {})

let editor: monaco.editor.IStandaloneCodeEditor | undefined
let zoneIDs: string[] = []

function addAnnotationsToEditor() {
  editor?.changeViewZones((changeAccessor) => {
    zoneIDs.forEach((zoneID) => {
      changeAccessor.removeZone(zoneID)
    })

    let domNode = document.createElement('div')
    domNode.classList.add('inline-comment')
    domNode.classList.add('va-typography-block')

    zoneIDs = Object.entries(functionAnnotations.value).map(([line, text]) => {
      domNode = domNode.cloneNode(true) as HTMLDivElement
      domNode.innerText = text

      return changeAccessor.addZone({
        afterLineNumber: Number(line),
        heightInLines: 2,
        domNode
      })
    })
  })
}

function editorDidMount(editor_: monaco.editor.IStandaloneCodeEditor) {
  editor = editor_

  editor.onMouseUp((event) => {
    const lineNumber = event.target.position?.lineNumber
    if (!lineNumber) return

    const comment = prompt('Comment on line ' + lineNumber + ':')
    emit('annotate', lineNumber, comment ?? undefined)
  })

  editor.onDidDispose(() => {
    editor = undefined
  })

  addAnnotationsToEditor()
}

watch(functionAnnotations, addAnnotationsToEditor)
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
        minimap: { enabled: false }
      }"
      @editorDidMount="editorDidMount"
    />
  </VaInnerLoading>
</template>

<style scoped>
:deep(.view-line) {
  cursor: pointer;
}

:deep(.view-line:hover) {
  background: rgb(255, 255, 179);
}

:deep(.inline-comment) {
  background: lightgray;
  margin-left: 1em;
  padding: 0.5em;
  padding-left: 0.75em;
  border: 0.25em;
  border-radius: 0.5em;
}
</style>
