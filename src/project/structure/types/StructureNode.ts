import type { StructureKind } from "#structure/types/StructureKind";
import type { StructureMirror } from "#structure/types/StructureMirror";
import type { StructureSource } from "#structure/types/StructureSource";
import type { UnclassifiedReason } from "#structure/types/UnclassifiedReason";
import type { Directory } from "#types/Directory";

export interface StructureNode {
  readonly path: Directory;
  readonly name: string;
  readonly kind: StructureKind;
  readonly source: StructureSource;
  readonly role?: string;
  readonly layers?: readonly string[];
  readonly layer?: number;
  readonly prefix?: string;
  readonly public?: boolean;
  readonly specifier?: string;
  readonly purpose?: string;
  readonly mirror?: StructureMirror;
  readonly reason?: UnclassifiedReason;
  readonly strays?: readonly Directory[];
  readonly children: readonly StructureNode[];
}
