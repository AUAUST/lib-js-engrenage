import type { Entity } from "#project/structure/types/Entity";
import type { ImportKind } from "#project/structure/types/ImportKind";
import type { ResolvedSpecifier } from "#project/structure/types/ResolvedSpecifier";
import type { File } from "#types/File";

export interface ImportEdge {
  readonly file: File;
  readonly importer: Entity | undefined;
  readonly specifier: string;
  readonly resolved: ResolvedSpecifier | undefined;
  readonly targetFile: File | undefined;
  readonly target: Entity | undefined;
  readonly kind: ImportKind;
}
