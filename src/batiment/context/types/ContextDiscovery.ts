import type { EnvironmentDiscovery } from "#batiment/context/types/EnvironmentDiscovery";
import type { ExpectedWorkspaces } from "#batiment/context/types/ExpectedWorkspaces";
import type { NamespaceDiscovery } from "#batiment/context/types/NamespaceDiscovery";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { DiscoveredWorkspace, ScopeTree } from "#batiment/scopes/index";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ContextDiscovery {
  readonly workspaces: readonly DiscoveredWorkspace[];
  /**
   * The top-level namespaces of each scope, by scope directory, then by name.
   */
  readonly namespaces: Readonly<
    Record<Directory, Readonly<Record<string, NamespaceDiscovery>>>
  >;
  readonly environments: EnvironmentDiscovery;
  readonly expected: readonly ExpectedWorkspaces[];
  readonly tree: ScopeTree;
  readonly diagnostics: readonly StructureDiagnostic[];
  readonly ignored: Globs;
}
