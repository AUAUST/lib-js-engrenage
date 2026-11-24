import type { NamespacePlacement } from "#batiment/context/types/NamespacePlacement";
import type { WorkspaceExpectation } from "#batiment/context/types/WorkspaceExpectation";
import type {
  EnvironmentPreset,
  EnvironmentRegistration,
} from "#batiment/environments/index";
import type { EnvironmentClaim, NamespaceKind } from "#batiment/scopes/index";
import type { Globs } from "#types/Globs";

export interface RootFacts {
  readonly ignored: Globs;
  readonly kinds: readonly NamespaceKind[];
  readonly presets: readonly EnvironmentPreset[];
  readonly namespaces: readonly NamespacePlacement[];
  readonly environments: readonly EnvironmentRegistration[];
  readonly claims: Readonly<Record<string, EnvironmentClaim>>;
  readonly workspaces: readonly WorkspaceExpectation[];
}
