import type { ScopeRegistry } from "#batiment/context/types/ScopeRegistry";
import type { WorkspaceExpectation } from "#batiment/context/types/WorkspaceExpectation";
import type { EnvironmentPreset } from "#batiment/environments/index";
import type { NamespaceKind } from "#batiment/scopes/index";
import type { Globs } from "#types/Globs";

export interface RootFacts extends ScopeRegistry {
  readonly ignored: Globs;
  readonly kinds: readonly NamespaceKind[];
  readonly presets: readonly EnvironmentPreset[];
  readonly workspaces: readonly WorkspaceExpectation[];
}
