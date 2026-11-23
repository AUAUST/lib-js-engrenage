import type { ExpectedWorkspaces } from "#batiment/context/types/ExpectedWorkspaces";
import type { NamespaceDiscovery } from "#batiment/context/types/NamespaceDiscovery";
import type { DiscoveredEnvironment } from "#batiment/environments/index";
import type { StructureDiagnostic } from "#batiment/report/index";
import type { DiscoveredWorkspace, ScopeTree } from "#batiment/scopes/index";
import type { Globs } from "#types/Globs";

export interface ContextDiscovery {
  readonly workspaces: readonly DiscoveredWorkspace[];
  readonly metafiles: readonly DiscoveredEnvironment[];
  readonly namespaces: Readonly<Record<string, NamespaceDiscovery>>;
  readonly expected: readonly ExpectedWorkspaces[];
  readonly tree: ScopeTree;
  readonly diagnostics: readonly StructureDiagnostic[];
  readonly ignored: Globs;
}
