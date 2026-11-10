import type { MetadataField } from "#project/structure/types/MetadataField";
import type { StructureRelation } from "#project/structure/types/StructureRelation";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface StructureMetadata {
  readonly path: Directory;
  readonly kind: "namespace" | "domain";
  readonly fields: {
    readonly purpose: MetadataField<string> | undefined;
    readonly layers: MetadataField<readonly string[]> | undefined;
    readonly relation: MetadataField<StructureRelation> | undefined;
    readonly specifier: MetadataField<string> | undefined;
    readonly internals: MetadataField<boolean> | undefined;
  };
  readonly files: readonly File[];
}
