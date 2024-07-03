export type Binary = {
  id: number
  name: string
  symbols: BinarySymbol[]
  disassembly: string
}

export type BinarySymbol = {
  name: string
  address: string
}
