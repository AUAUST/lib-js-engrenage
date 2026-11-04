import type { Globs } from "#types/Globs";

export interface ResolvedFiles {
  readonly generated: Globs;
  readonly discovered: Globs;
  readonly fixtures: Globs;
  readonly published: Globs;
  readonly private: Globs;
}
