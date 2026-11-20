import type { Directories } from "#types/Directories";

export interface ScopedEnvironment {
  readonly id: string;
  readonly scope: string;
  readonly name: string;
  readonly kind: string;
  readonly dirs: Directories;
}
