import type { ResolvedWorkspace } from "#project/workspaces/types/ResolvedWorkspace";
import type { WorkspaceTsconfig } from "#project/workspaces/types/WorkspaceTsconfig";
import type { Directories } from "#types/Directories";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export interface ResolvedWorkspaceGroup {
  readonly glob: Glob;
  readonly active: boolean;
  readonly dirs: Directories;
  readonly generated: Globs;
  readonly discovered: Globs;
  readonly globs: Globs;
  readonly tsconfig: WorkspaceTsconfig;
  readonly workspaces: readonly ResolvedWorkspace[];
}
