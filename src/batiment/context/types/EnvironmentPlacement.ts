import type { Directories } from "#types/Directories";
import type { Globs } from "#types/Globs";

export interface EnvironmentPlacement {
  readonly name: string;
  readonly kind: string;
  readonly dirs: Directories;
  readonly files: Globs;
}
