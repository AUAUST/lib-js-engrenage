import type { Filesystem } from "#foundation/filesystem/index";
import type { ListOption } from "#foundation/options/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";

export interface ResolvedGit {
  readonly local: {
    readonly gitignore: boolean;
    readonly files: ListOption<Glob> | undefined;
  };
  readonly gitignore: Promise<File | undefined>;
  readonly ignoreFiles: Promise<Files>;
  readonly root: Directory;
  readonly filesystem: Filesystem;
}
