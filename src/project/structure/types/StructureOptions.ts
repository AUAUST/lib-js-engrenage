import type { ReexportMode } from "#project/roles/index";
import type { StructureRelation } from "#project/structure/types/StructureRelation";
import type { StructureSource } from "#project/structure/types/StructureSource";
import type { Directory } from "#types/Directory";

export interface StructureOptions {
  readonly namespaces: Readonly<
    Record<
      Directory,
      {
        readonly layers: readonly string[] | undefined;
        readonly relation: StructureRelation;
        readonly children: "domains" | undefined;
        readonly purpose: string | undefined;
        readonly roles: { readonly enable: readonly string[] };
        readonly source: StructureSource;
      }
    >
  >;
  // @debt the domain fields repeat those of `DeclaredStructure`, which this type could extend with `source`
  readonly domains: Readonly<
    Record<
      string,
      {
        readonly specifier: string | undefined;
        readonly purpose: string | undefined;
        readonly internals: boolean | undefined;
        readonly reexport: ReexportMode | readonly ReexportMode[] | undefined;
        readonly collects: readonly string[] | undefined;
        readonly public: boolean | undefined;
        readonly source: StructureSource;
      }
    >
  >;
  readonly optOut: readonly Directory[];
  readonly strictness: "strict" | "loose";
}
