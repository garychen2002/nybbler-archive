export type CollabProject = {
  binaries?: Record<number, CollabBinary>
}

export type CollabBinary = {
  symbolOverrides?: CollabSymbolOverrides
}

export type CollabSymbolOverrides = Record<string, string>
