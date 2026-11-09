import type {
  ContributedEnvironment,
  ResolvedTests,
} from "#project/environments/index";
import type { ResolvedFiles } from "#project/structure/index";
import type { ResolvedWorkspaceGroup } from "#project/workspaces/index";

export interface ScopeSources {
  readonly environments: Readonly<
    Partial<Record<string, ContributedEnvironment>>
  >;
  readonly tests: ResolvedTests;
  readonly files: ResolvedFiles;
  readonly workspaces: readonly ResolvedWorkspaceGroup[];
}
