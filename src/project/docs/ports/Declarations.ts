import type { SourceDeclaration } from "#project/docs/types/SourceDeclaration";
import type { File } from "#types/File";

/**
 * The documented exports of the project's source files.
 *
 * @experimental
 */
export interface Declarations {
  /**
   * Lists the declarations `file` exports itself, in source order, reading it
   * through the staged filesystem so files written earlier in the same sync are
   * seen; re-exports from other modules are left out. Memoized per file for the
   * lifetime of the resolved config. Rejects when the file does not exist or a
   * JSDoc block carries an undeclared or invalid doc tag.
   */
  of(file: File): Promise<readonly SourceDeclaration[]>;
}
