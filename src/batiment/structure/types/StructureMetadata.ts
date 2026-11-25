import type { ReexportMode } from "#batiment/roles/index";
import type { MetadataField } from "#batiment/structure/types/MetadataField";
import type { StructureRelation } from "#batiment/structure/types/StructureRelation";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface StructureMetadata {
  readonly directory: Directory;
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
  readonly fields: {
    readonly purpose: MetadataField<string> | undefined;
    readonly debt: MetadataField<string> | undefined;
    readonly layers: MetadataField<readonly string[]> | undefined;
    readonly relation: MetadataField<StructureRelation> | undefined;
    readonly children: MetadataField<"domains"> | undefined;
    readonly specifier: MetadataField<string> | undefined;
    readonly internals: MetadataField<boolean> | undefined;
    readonly reexport:
      MetadataField<ReexportMode | readonly ReexportMode[]> | undefined;
    readonly collects: MetadataField<readonly string[]> | undefined;
    readonly publicRoles: MetadataField<readonly string[]> | undefined;
    readonly public: MetadataField<boolean> | undefined;
  };
  readonly files: readonly File[];
}
