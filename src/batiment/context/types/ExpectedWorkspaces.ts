import type { Directories } from "#types/Directories";
import type { Glob } from "#types/Glob";

export interface ExpectedWorkspaces {
  readonly glob: Glob;
  readonly dirs: Directories;
  readonly missing: Directories;
}
