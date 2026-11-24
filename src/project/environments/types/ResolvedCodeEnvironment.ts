import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface ResolvedCodeEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
  readonly generated: Globs;
  readonly discovered: Globs;
  readonly globs: Globs;
}
