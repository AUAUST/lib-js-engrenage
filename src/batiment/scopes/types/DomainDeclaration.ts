import type { ReexportMode } from "#batiment/roles/index";
import type { NamespaceDeclaration } from "#batiment/scopes/types/NamespaceDeclaration";

export interface DomainDeclaration {
  readonly specifier: string | undefined;
  readonly purpose: string | undefined;
  readonly internals: boolean | undefined;
  readonly reexport: ReexportMode | readonly ReexportMode[] | undefined;
  readonly collects: readonly string[] | undefined;
  readonly public: boolean | undefined;
  readonly namespaces: Readonly<Record<string, NamespaceDeclaration>>;
  readonly domains: Readonly<Record<string, DomainDeclaration>>;
}
