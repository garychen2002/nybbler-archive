import type { User } from '@/models/user'
import { useMeStore } from '@/stores/me'
import type { DocHandle } from '@automerge/automerge-repo'
import { ref, watchEffect } from 'vue'

export type CollabUserState = {
  user?: User
  binaryID?: number
}

export function useCollabUserState<Doc>() {
  const userStates = ref<CollabUserState[]>([])
  const lastSeen: Record<number, number> = {}

  function ingestUserState(newState: CollabUserState) {
    const { user } = newState
    if (!user) return

    lastSeen[user.id] = Date.now()

    const existingState = userStates.value.find((state) => state.user!.id === user.id)
    if (existingState) Object.assign(existingState, newState)
    else userStates.value.push(newState as CollabUserState)
  }

  let broadcastIntervalID: ReturnType<typeof setInterval> | undefined

  async function broadcastUserState(
    docHandle: DocHandle<Doc> | undefined,
    myUserState: CollabUserState
  ) {
    ingestUserState(myUserState)

    // Periodically broadcast this user's state to all peers.
    if (docHandle) {
      if (broadcastIntervalID) clearInterval(broadcastIntervalID)
      broadcastIntervalID = setInterval(() => {
        docHandle.broadcast(myUserState)
      }, 500)
    }
  }

  function stopBroadcastingUserState() {
    if (broadcastIntervalID) clearInterval(broadcastIntervalID)
  }

  const meStore = useMeStore()
  watchEffect(async () => {
    await meStore.init()
  })

  let listenIntervalID: ReturnType<typeof setInterval> | undefined

  async function listenForUserStates(docHandle: DocHandle<Doc>) {
    docHandle.on('ephemeral-message', ({ message }) => {
      ingestUserState(message as CollabUserState)
    })

    // Periodically check for users who have dropped off.
    if (listenIntervalID) clearInterval(listenIntervalID)
    listenIntervalID = setInterval(() => {
      const now = Date.now()
      userStates.value = userStates.value.filter(
        (state) =>
          // current user, from whom we never receive heartbeat pings...
          state.user!.id === meStore.user?.id ||
          // or another user, from whom we have received a recent heartbeat ping.
          now - lastSeen[state.user!.id] < 2000
      )
      console.log([...userStates.value])
    }, 1000)
  }

  return {
    userStates,
    broadcastUserState,
    stopBroadcastingUserState,
    listenForUserStates
  }
}
