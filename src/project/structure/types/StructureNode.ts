import type { StructureKind } from "#project/structure/types/StructureKind";
import type { StructureSource } from "#project/structure/types/StructureSource";
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
  readonly children: readonly StructureNode[];
}
