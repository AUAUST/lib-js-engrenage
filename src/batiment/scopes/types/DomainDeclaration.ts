import type { ReexportMode } from "#batiment/roles/index";
import type { NamespaceDeclaration } from "#batiment/scopes/types/NamespaceDeclaration";
import type { File } from "#types/File";

// @debt the declared fields repeat the domain fields of `DeclaredStructure` and `StructureOptions`, so each new field lands in three lists
export interface DomainDeclaration {
  readonly specifier: string | undefined;
  readonly exports: Readonly<Record<string, File>> | undefined;
  readonly purpose: string | undefined;
  readonly debt: string | undefined;
  readonly internals: boolean | undefined;
  readonly reexport: ReexportMode | readonly ReexportMode[] | undefined;
  readonly collects: readonly string[] | undefined;
  readonly publicRoles: readonly string[] | undefined;
  readonly public: boolean | undefined;
  readonly namespaces: Readonly<Record<string, NamespaceDeclaration>>;
  readonly domains: Readonly<Record<string, DomainDeclaration>>;
}
