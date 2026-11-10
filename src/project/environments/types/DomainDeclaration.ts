import type { NamespaceDeclaration } from "#project/environments/types/NamespaceDeclaration";

export interface DomainDeclaration {
  readonly specifier: string | undefined;
  readonly purpose: string | undefined;
  readonly internals: boolean | undefined;
  readonly namespaces: Readonly<Record<string, NamespaceDeclaration>>;
  readonly domains: Readonly<Record<string, DomainDeclaration>>;
}
