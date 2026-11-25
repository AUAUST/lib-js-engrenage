import type { Role } from "#batiment/roles/index";
import type { DomainDeclaration } from "#batiment/scopes/types/DomainDeclaration";

export interface NamespaceDeclaration {
  readonly layers: readonly string[] | undefined;
  // @debt the relations and `children` values repeat the picklists of `declareStructureNodes` and the `StructureRelation` of `project/structure`
  readonly relation: "peers" | "isolated" | undefined;
  readonly children: "domains" | undefined;
  readonly purpose: string | undefined;
  readonly debt: string | undefined;
  readonly roles: { readonly enable: readonly (string | Role)[] };
  readonly namespaces: Readonly<Record<string, NamespaceDeclaration>>;
  readonly domains: Readonly<Record<string, DomainDeclaration>>;
}
