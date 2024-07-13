import { ref } from 'vue'

export function useInitializeStore(onInit: () => Promise<void>) {
  const currentlyInitializing = ref(false)
  const initialized = ref(false)

  async function init() {
    if (initialized.value || currentlyInitializing.value) return

    currentlyInitializing.value = true
    await onInit()
    currentlyInitializing.value = false

    initialized.value = true
  }

  async function reinit() {
    initialized.value = false
    await init()
  }

  return { initialized, init, reinit }
}
