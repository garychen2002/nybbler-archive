import type { DocumentId } from '@automerge/automerge-repo'
import type { Binary } from './binaries/binary'
import type { User } from './user'

export type Project = {
  id: number
  name: string
  automergeDocumentId: DocumentId
  invitees: User[]
  binaries: Binary[]
}
