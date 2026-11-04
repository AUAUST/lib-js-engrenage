import type { ResolvedBaseTsconfig } from "#project/tsconfig/types/ResolvedBaseTsconfig";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export interface ResolvedTypescript {
  readonly tsconfig: ResolvedBaseTsconfig;
  readonly envFile: File;
  readonly files: Globs;
}
