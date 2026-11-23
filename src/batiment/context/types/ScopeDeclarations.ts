import type { NamespaceDeclarations } from "#batiment/context/types/NamespaceDeclarations";

export interface ScopeDeclarations {
  readonly internals: boolean;
  readonly namespaces: readonly NamespaceDeclarations[];
}
