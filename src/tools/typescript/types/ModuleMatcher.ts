import type { File } from "#types/File";

/**
 * Whether `file` is a TypeScript module of the environment covering it.
 */
export type ModuleMatcher = (file: File) => boolean;
