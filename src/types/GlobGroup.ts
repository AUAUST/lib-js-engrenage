import type { Globs } from "#types/Globs";

/**
 * Globs written together in an ignore file, under `title` as a comment.
 */
export interface GlobGroup {
  readonly title: string;
  readonly globs: Globs;
}
