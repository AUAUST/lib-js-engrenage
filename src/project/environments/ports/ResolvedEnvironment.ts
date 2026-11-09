import type { Directories } from "#types/Directories";

export interface ResolvedEnvironment {
  readonly active: boolean;
  readonly dirs: Directories;
}
