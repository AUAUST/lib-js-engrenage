import type { File } from "#types/File";

export interface ResolvedPrettier {
  readonly prettierignore: Promise<File | undefined>;
}
