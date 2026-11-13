import type { FileFormatter } from "#foundation/filesystem/types/FileFormatter";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";
import type { SyncResults } from "#types/SyncResults";

/**
 * @experimental
 */
export interface Filesystem {
  read(file: File): Promise<string | undefined>;
  exists(file: File): Promise<boolean>;
  isDirectory(directory: Directory): Promise<boolean>;
  write(file: File, content: string): Promise<void>;
  remove(file: File): Promise<void>;
  glob(patterns: Glob | Globs, options?: { exclude?: Globs }): Promise<Files>;
  list(
    directory: Directory,
    options?: { skip?: Globs; recursive?: boolean },
  ): Promise<Files>;
  format(formatter: FileFormatter): Promise<void>;
  changes(): SyncResults;
  discard(): SyncResults;
  flush(): Promise<SyncResults>;
}
