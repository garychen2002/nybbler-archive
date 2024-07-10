import type { User } from './user'

export type ProjectMetadata = {
  id: number
  name: string
  automergeDocumentId: string
  invitees: User[]
}
