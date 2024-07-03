export type PaginatedResponse<Item> = {
  total: number
  items: Item[]
  older: { id: number } | null
  newer: { id: number } | null
}
