import { apiFunctions } from '@/services/api'

export type Function = {
  id: number
  symbolId: number
  disassembly: string
}

export function fetchFunction(id: number) {
  return apiFunctions.get<Function>(`/${id}`)
}
