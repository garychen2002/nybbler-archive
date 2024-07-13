import { Repo } from '@automerge/automerge-repo'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'

const { VITE_WEBSOCKET_URL } = import.meta.env

export const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter(VITE_WEBSOCKET_URL)],
  storage: new IndexedDBStorageAdapter()
})
