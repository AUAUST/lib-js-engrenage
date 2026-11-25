import type { ResolvedWorkspace } from "#project/workspaces/types/ResolvedWorkspace";
import type { Directories } from "#types/Directories";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

// @debt nothing reads `purpose`, copied from `workspaces.globs`: the project maps take a workspace's purpose from its scope
export interface ResolvedWorkspaceGroup {
  readonly glob: Glob;
  readonly active: boolean;
  readonly purpose?: string;
  readonly dirs: Directories;
  readonly missing: Directories;
  readonly generated: Globs;
  readonly discovered: Globs;
  readonly globs: Globs;
  readonly workspaces: readonly ResolvedWorkspace[];
}
