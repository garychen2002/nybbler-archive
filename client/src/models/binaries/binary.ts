import type { BinaryAddress } from './address'

export type Binary = {
  id: number
  name: string
  symbols: BinarySymbol[]
  disassembly: string // TODO: better type
}

export type BinarySymbol = {
  name: string
  address: BinaryAddress
}
