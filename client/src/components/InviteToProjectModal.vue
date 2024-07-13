<script setup lang="ts">
import type { ProjectMetadata } from '@/models/project_metadata'
import type { User } from '@/models/user'
import { useUsersStore } from '@/stores/users'
import { keyBy } from 'lodash'
import { computed, ref, watchEffect } from 'vue'
import { VaButton, VaIcon, VaModal, VaSelect } from 'vuestic-ui'

const props = defineProps<{
  project?: ProjectMetadata
}>()

const show = defineModel<boolean>('show', { required: true })

defineEmits<{
  submit: [User[]]
}>()

const newInvitees = ref<User[]>([])
watchEffect(() => {
  if (props.project) {
    newInvitees.value = []
  }
})

const usersStore = useUsersStore()
watchEffect(async () => {
  await usersStore.init()
})

const invitedUsersByID = computed(() => keyBy(props.project?.invitees ?? [], ({ id }) => id))
const notInvitedUsers = computed(() =>
  usersStore.users.filter((user) => !invitedUsersByID.value[user.id])
)

function makeUserOption(user: User) {
  return { id: user.id, label: `${user.name} (${user.username})` }
}

const usersOptions = computed(() =>
  notInvitedUsers.value.map(makeUserOption).sort((a, b) => a.label.localeCompare(b.label))
)
const selectedUsers = computed({
  get: () => newInvitees.value.map(makeUserOption) ?? [],
  set(newValue) {
    if (newInvitees.value) {
      newInvitees.value = newValue.map((option) => usersStore.usersByID[option.id])
    }
  }
})
</script>

<template>
  <VaModal v-model="show" hide-default-actions size="small">
    <h3 class="va-h6 mb-4">invite to project</h3>
    <VaForm class="mb-4 flex flex-col items-baseline gap-6" @submit="$emit('submit', newInvitees)">
      <VaSelect
        v-model="selectedUsers"
        :options="usersOptions"
        track-by="id"
        text-by="label"
        multiple
        searchable
        highlight-matched-text
        no-options-text="all users already have access to this project!"
        autofocus
        class="w-full"
        label="users to invite"
      >
        <template #prependInner>
          <VaIcon name="person" />
        </template>
      </VaSelect>
    </VaForm>

    <template #footer>
      <VaButton class="me-3" preset="secondary" @click="() => (show = false)"> cancel </VaButton>
      <VaButton color="primary" @click="$emit('submit', newInvitees)"> invite </VaButton>
    </template>
  </VaModal>
</template>
