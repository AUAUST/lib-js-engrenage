import type { DocTag } from "#project/docs/types/DocTag";

/**
 * The JSDoc block of one signature: an overload signature or a declaration
 * without overloads.
 *
 * @experimental
 */
export interface DocSignature {
  /**
   * The block's text before its first tag, with blank leading and trailing lines
   * removed.
   */
  readonly description: string;
  /**
   * The block's tags whose declaration has the `signature` scope, in source
   * order.
   */
  readonly tags: readonly DocTag[];
}
