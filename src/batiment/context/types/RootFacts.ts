import type { NamespacePlacement } from "#batiment/context/types/NamespacePlacement";
import type { WorkspaceExpectation } from "#batiment/context/types/WorkspaceExpectation";
import type { EnvironmentClaim, NamespaceKind } from "#batiment/scopes/index";
import type { Globs } from "#types/Globs";

export interface RootFacts {
  readonly ignored: Globs;
  readonly kinds: readonly NamespaceKind[];
  readonly languages: readonly string[];
  readonly namespaces: readonly NamespacePlacement[];
  readonly claims: Readonly<Record<string, EnvironmentClaim>>;
  readonly workspaces: readonly WorkspaceExpectation[];
}
