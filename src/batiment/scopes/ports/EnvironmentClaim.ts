import type { Directories } from "#types/Directories";

export interface EnvironmentClaim {
  readonly owns: Directories;
  readonly dirs: Directories | undefined;
  readonly named: Directories;
}
