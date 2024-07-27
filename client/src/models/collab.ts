// This describes the Automerge document structure for real-time collaboration.
// Shared with server.

export type CollabProject = {
  binaries?: Record<number, CollabBinary>
}

export type CollabBinary = {
  analysisStatus?: CollabBinaryAnalysisStatus
  symbolOverrides?: CollabSymbolOverrides
  bookmarkedAddresses?: CollabBookmarkedAddresses
  annotations?: CollabAnnotation[]
}

export type CollabBinaryAnalysisStatus = undefined | 'failed' | 'complete'
export type CollabSymbolOverrides = Record<string, string>
export type CollabBookmarkedAddresses = string[]

export type CollabAnnotation = {
  address: string
  text: string
}
