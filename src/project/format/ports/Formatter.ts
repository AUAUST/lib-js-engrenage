import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export type Formatter = (
  content: string,
  options: { path: File; root: Directory },
) => Promise<string | undefined>;
