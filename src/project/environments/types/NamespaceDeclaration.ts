import type { DomainDeclaration } from "#project/environments/types/DomainDeclaration";
import type { Role } from "#project/roles/index";

export interface NamespaceDeclaration {
  readonly layers: readonly string[] | undefined;
  // @debt the relations repeat the picklist of `declareStructureNodes` and the `StructureRelation` of `project/structure`
  readonly relation: "peers" | "isolated";
  readonly purpose: string | undefined;
  readonly roles: { readonly enable: readonly (string | Role)[] };
  readonly namespaces: Readonly<Record<string, NamespaceDeclaration>>;
  readonly domains: Readonly<Record<string, DomainDeclaration>>;
}
