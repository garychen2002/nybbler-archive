// This describes the Automerge document structure for real-time collaboration.
// Shared with clients.

export type CollabProject = {
  binaries?: Record<number, CollabBinary>;
};

export type CollabBinary = {
  analysisStatus?: "failed" | "complete";
  symbolOverrides?: CollabSymbolOverrides;
  bookmarkedAddresses?: CollabBookmarkedAddresses;
  annotations?: CollabAnnotation[];
};

export type CollabSymbolOverrides = Record<string, string>;
export type CollabBookmarkedAddresses = string[];

export type CollabAnnotation = {
  address: string;
  text: string;
};
