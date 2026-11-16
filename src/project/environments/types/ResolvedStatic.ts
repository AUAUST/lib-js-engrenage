import type { Directories } from "#types/Directories";

export interface ResolvedStatic {
  readonly active: boolean;
  readonly dirs: Directories;
}
