export type CollabProject = {
  binaries?: Record<number, CollabBinary>
}

export type CollabBinary = {
  symbolOverrides?: CollabSymbolOverrides
  bookmarkedAddresses?: CollabBookmarkedAddresses
}

export type CollabSymbolOverrides = Record<string, string>
export type CollabBookmarkedAddresses = string[]
