import type { File } from "#types/File";

/**
 * Whether `file` takes an extension its language has in the environment
 * covering it.
 */
export type LanguageFileMatcher = (file: File) => boolean;
