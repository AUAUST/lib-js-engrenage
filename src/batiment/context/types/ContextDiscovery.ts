import type { EnvironmentDiscovery } from "#batiment/context/types/EnvironmentDiscovery";
import type { ExpectedWorkspaces } from "#batiment/context/types/ExpectedWorkspaces";
import type { DiscoveredEnvironment } from "#batiment/environments/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { DiscoveredWorkspace, ScopeTree } from "#batiment/scopes/index";
import type { Globs } from "#types/Globs";

export interface ContextDiscovery {
  readonly workspaces: readonly DiscoveredWorkspace[];
  readonly metafiles: readonly DiscoveredEnvironment[];
  readonly environments: Readonly<Record<string, EnvironmentDiscovery>>;
  readonly expected: readonly ExpectedWorkspaces[];
  readonly tree: ScopeTree;
  readonly diagnostics: readonly StructureDiagnostic[];
  readonly ignored: Globs;
}
