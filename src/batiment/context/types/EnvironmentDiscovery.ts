import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface EnvironmentDiscovery {
  readonly dirs: Directories;
  readonly rootFiles: Globs;
  readonly active: boolean;
}
