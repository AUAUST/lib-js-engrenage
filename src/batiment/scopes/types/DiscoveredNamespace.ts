import type { NamespaceImports } from "#batiment/scopes/types/NamespaceImports";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

/**
 * The `.namespace.json` of a top-level namespace, with the kind it names, the
 * namespaces of its scope it opts in to import, its purpose and its debt.
 */
export interface DiscoveredNamespace {
  readonly dir: Directory;
  readonly file: File;
  readonly kind?: string;
  readonly imports?: NamespaceImports;
  readonly purpose?: string;
  readonly debt?: string;
}
