import type { File } from "#types/File";

export type FileFormatter = (
  file: File,
  content: string,
) => Promise<string | undefined>;
