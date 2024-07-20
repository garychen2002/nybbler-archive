export type Binary = {
  id: number
  name: string
  symbols: BinarySymbol[]
  md5hash: string
}

export type BinarySymbol = {
  name: string
  address: string
  functionId?: number
}
