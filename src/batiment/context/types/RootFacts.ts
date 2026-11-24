import type { ScopeRegistry } from "#batiment/context/types/ScopeRegistry";
import type { WorkspaceExpectation } from "#batiment/context/types/WorkspaceExpectation";
import type { Globs } from "#types/Globs";

export interface RootFacts extends ScopeRegistry {
  readonly ignored: Globs;
  readonly workspaces: readonly WorkspaceExpectation[];
}
