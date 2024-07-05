import type { User } from './user'

export type ProjectMetadata = {
  id: number
  name: string
  invitees: User[]
}
