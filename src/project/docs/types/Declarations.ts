import type { SourceDeclaration } from "#project/docs/types/SourceDeclaration";
import type { File } from "#types/File";

/**
 * @experimental
 */
export interface Declarations {
  of(file: File): Promise<readonly SourceDeclaration[]>;
}
