import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

/**
 * Builds a frozen tag declaration from the preset's defaults, each given option
 * replacing its field.
 *
 * @experimental
 */
export type TagPreset = (options?: Partial<TagDeclaration>) => TagDeclaration;
