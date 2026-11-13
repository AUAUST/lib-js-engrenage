import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

/**
 * @experimental
 */
export type TagPreset = (options?: Partial<TagDeclaration>) => TagDeclaration;
