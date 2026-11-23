import type { DeclaredNamespace } from "#batiment/structure/index";

export interface NamespaceDeclarations extends Omit<
  DeclaredNamespace,
  "dirs" | "active" | "read"
> {}
