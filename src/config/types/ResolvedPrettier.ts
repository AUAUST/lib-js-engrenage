import type { File } from "#types/File";

export interface ResolvedPrettier {
  readonly prettierignore: File | undefined;
}
