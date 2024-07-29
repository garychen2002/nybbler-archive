export type Binary = {
  id: number
  name: string
  symbols: BinarySymbol[]
  virustotalID: string
}

export type BinarySymbol = {
  name: string
  address: string
  functionId?: number
}
