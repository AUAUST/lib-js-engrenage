import type { ReexportMode } from "#batiment/roles/index";
import type { OptionSource } from "#project/structure/types/OptionSource";
import type { StructureRelation } from "#project/structure/types/StructureRelation";
import type { StructureSource } from "#project/structure/types/StructureSource";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

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
        readonly collectsSource:
          | { readonly files: readonly File[]; readonly config?: OptionSource }
          | undefined;
      }
    >
  >;
  readonly optOut: readonly Directory[];
  readonly strictness: "strict" | "loose";
}
