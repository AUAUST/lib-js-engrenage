import type { File } from "#types/File";

/**
 * The extensions its language has in the environment covering `file`.
 *
 * @throws When `file` lies in no environment.
 */
export type LanguageExtensions = (file: File) => readonly string[];
