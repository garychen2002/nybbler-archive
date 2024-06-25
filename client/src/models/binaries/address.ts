export type BinaryAddress = number

export function formatBinaryAddress(address: BinaryAddress) {
  return `0x${address.toString(16)}`
}
