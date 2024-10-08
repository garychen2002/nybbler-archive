// This describes the Automerge document structure for real-time collaboration.
// Shared with clients.

export type CollabProject = {
  binaries?: Record<number, CollabBinary>;
};

export type CollabBinary = {
  analysisStatus?: CollabBinaryAnalysisStatus;
  symbolOverrides?: CollabSymbolOverrides;
  bookmarkedAddresses?: CollabBookmarkedAddresses;
  annotations?: CollabAnnotations;
};

export type CollabBinaryAnalysisStatus = undefined | "failed" | "complete";
export type CollabSymbolOverrides = Record<string, string>;
export type CollabBookmarkedAddresses = string[];
export type CollabAnnotations = Record<string, Record<string, CollabAnnotation>>;

export type CollabAnnotation = {
  userIds: number[];
  text: string;
};
