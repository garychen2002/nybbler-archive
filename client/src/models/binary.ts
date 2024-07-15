export type Binary = {
  id: number
  name: string
  symbols: BinarySymbol[]
}

export type BinarySymbol = {
  name: string
  address: string
  functionId?: number
}
