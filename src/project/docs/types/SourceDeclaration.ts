import type { DocSignature } from "#project/docs/types/DocSignature";
import type { DocTag } from "#project/docs/types/DocTag";

/**
 * One name a source file exports, with its documentation.
 *
 * @experimental
 */
export interface SourceDeclaration {
  /**
   * The exported name: `default` for a default export, the alias for a renamed
   * export specifier, and one entry per name a destructuring declaration binds.
   */
  readonly name: string;
  /**
   * `const` also covers a default-exported expression.
   */
  readonly kind: "function" | "const" | "class" | "type" | "interface" | "enum";
  /**
   * The tags whose declaration has the `export` scope, read from the first
   * signature's block only.
   */
  readonly tags: readonly DocTag[];
  /**
   * One entry per documented overload signature, skipping the implementation, or
   * the declaration's own block; empty when undocumented.
   */
  readonly signatures: readonly DocSignature[];
}
