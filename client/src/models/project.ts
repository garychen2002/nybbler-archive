import type { Binary } from './binaries/binary'
import type { User } from './user'

export type Project = {
  id: number
  name: string
  invitees: User[]
  binaries: Binary[]
}
