import type { NamespaceInstance } from "#batiment/scopes/types/NamespaceInstance";
import type { Directory } from "#types/Directory";

export interface Scope {
  readonly key: string;
  readonly dir: Directory;
  readonly parent: string | undefined;
  readonly purpose?: string;
  readonly namespaces: readonly NamespaceInstance[];
}
