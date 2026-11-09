import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface ResolvedEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
  readonly globs?: Globs;
  readonly generated?: Globs;
  readonly discovered?: Globs;
  readonly rootFiles?: Globs;
}
