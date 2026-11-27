import type { Globs } from "#types/Globs";

/**
 * Whether a top-level namespace is active, and the globs of the files at the
 * project root it holds.
 */
export interface RootFilesPlacement {
  readonly active: boolean;
  readonly rootFiles?: Globs;
}
