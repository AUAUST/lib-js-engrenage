import type { File } from "#types/File";

/**
 * Generated instruction `content` as the host formats it for the file at `path`,
 * or unchanged when the host formats no such file.
 */
export type InstructionFormatter = (
  content: string,
  path: File,
) => Promise<string>;
