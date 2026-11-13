import type { DocSignature } from "#project/docs/types/DocSignature";
import type { DocTag } from "#project/docs/types/DocTag";

/**
 * @experimental
 */
export interface SourceDeclaration {
  readonly name: string;
  readonly kind: "function" | "const" | "class" | "type" | "interface" | "enum";
  readonly tags: readonly DocTag[];
  readonly signatures: readonly DocSignature[];
}
