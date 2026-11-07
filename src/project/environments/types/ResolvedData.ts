import type { Directories } from "#types/Directories";
import type { File } from "#types/File";

export interface ResolvedData {
  readonly active: boolean;
  readonly dirs: Directories;
  readonly exports: Readonly<Record<string, File>>;
}
