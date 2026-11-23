import type { EnvironmentPlacement } from "#batiment/context/types/EnvironmentPlacement";
import type { WorkspaceExpectation } from "#batiment/context/types/WorkspaceExpectation";
import type { EnvironmentClaim, NamespaceKind } from "#batiment/scopes/index";
import type { Globs } from "#types/Globs";

export interface RootFacts {
  readonly ignored: Globs;
  readonly kinds: readonly NamespaceKind[];
  readonly languages: readonly string[];
  readonly environments: readonly EnvironmentPlacement[];
  readonly claims: Readonly<Record<string, EnvironmentClaim>>;
  readonly workspaces: readonly WorkspaceExpectation[];
}
