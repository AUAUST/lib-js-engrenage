import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureMirror } from "#project/structure/types/StructureMirror";
import type { StructureRelation } from "#project/structure/types/StructureRelation";
import type { StructureSource } from "#project/structure/types/StructureSource";
import type { UnclassifiedReason } from "#project/structure/types/UnclassifiedReason";
import type { Directory } from "#types/Directory";

export interface StructureNode {
  readonly path: Directory;
  readonly name: string;
  readonly kind: StructureKind;
  readonly source: StructureSource;
  readonly role?: string;
  readonly layers?: readonly string[];
  readonly layer?: number;
  readonly relation?: StructureRelation;
  readonly public?: boolean;
  readonly specifier?: string;
  readonly purpose?: string;
  readonly mirror?: StructureMirror;
  readonly reason?: UnclassifiedReason;
  readonly strays?: readonly Directory[];
  readonly children: readonly StructureNode[];
}
