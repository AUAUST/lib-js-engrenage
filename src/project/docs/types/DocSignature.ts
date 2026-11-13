import type { DocTag } from "#project/docs/types/DocTag";

/**
 * @experimental
 */
export interface DocSignature {
  readonly description: string;
  readonly tags: readonly DocTag[];
}
