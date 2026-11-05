import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface ResolvedGit {
  readonly gitignore: Promise<File | undefined>;
  readonly root: Directory;
  readonly filesystem: Filesystem;
}
