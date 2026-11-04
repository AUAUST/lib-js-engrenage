import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface ResolvedGit {
  readonly gitignore: File | undefined;
  readonly root: Directory;
  readonly filesystem: Filesystem;
}
