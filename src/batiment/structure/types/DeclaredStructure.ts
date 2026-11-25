import type { ReexportMode } from "#batiment/roles/index";
import type { StructureRelation } from "#batiment/structure/types/StructureRelation";
import type { Directory } from "#types/Directory";

export interface DeclaredStructure {
  readonly namespaces: Readonly<
    Record<
      Directory,
      {
        readonly layers: readonly string[] | undefined;
        readonly relation: StructureRelation | undefined;
        readonly children: "domains" | undefined;
        readonly purpose: string | undefined;
        readonly debt: string | undefined;
        readonly roles: { readonly enable: readonly string[] };
      }
    >
  >;
  readonly domains: Readonly<
    Record<
      string,
      {
        readonly specifier: string | undefined;
        readonly purpose: string | undefined;
        readonly debt: string | undefined;
        readonly internals: boolean | undefined;
        readonly reexport: ReexportMode | readonly ReexportMode[] | undefined;
        readonly collects: readonly string[] | undefined;
        readonly publicRoles: readonly string[] | undefined;
        readonly public: boolean | undefined;
      }
    >
  >;
}
