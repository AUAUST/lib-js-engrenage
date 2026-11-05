import type { StructureRelation } from "#project/structure/types/StructureRelation";
import type { Directory } from "#types/Directory";

export interface StructureOptions<Reference = string> {
  readonly namespaces: Readonly<
    Record<
      Directory,
      {
        readonly layers: readonly string[] | undefined;
        readonly relation: StructureRelation;
        readonly purpose: string | undefined;
        readonly roles: { readonly enable: readonly Reference[] };
      }
    >
  >;
  readonly domains: Readonly<
    Record<
      string,
      {
        readonly specifier: string | undefined;
        readonly purpose: string | undefined;
      }
    >
  >;
  readonly optOut: readonly Directory[];
  readonly strictness: "strict" | "loose";
}
