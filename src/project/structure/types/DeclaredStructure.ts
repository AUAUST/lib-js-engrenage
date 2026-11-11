import type { ReexportMode } from "#project/roles/index";
import type { StructureRelation } from "#project/structure/types/StructureRelation";
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
        readonly internals: boolean | undefined;
        readonly reexport: ReexportMode | readonly ReexportMode[] | undefined;
        readonly public: boolean | undefined;
      }
    >
  >;
}
