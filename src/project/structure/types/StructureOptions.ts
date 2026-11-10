import type { StructureRelation } from "#project/structure/types/StructureRelation";
import type { Directory } from "#types/Directory";

export interface StructureOptions {
  readonly namespaces: Readonly<
    Record<
      Directory,
      {
        readonly layers: readonly string[] | undefined;
        readonly relation: StructureRelation;
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
      }
    >
  >;
  readonly optOut: readonly Directory[];
  readonly strictness: "strict" | "loose";
}
