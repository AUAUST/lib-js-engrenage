import type { File } from "#types/File";

export type Formatter = (
  file: File,
  content: string,
) => Promise<string | undefined>;
