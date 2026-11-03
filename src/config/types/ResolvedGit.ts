import type { File } from "#types/File";

export interface ResolvedGit {
  readonly gitignore: File | undefined;
}
