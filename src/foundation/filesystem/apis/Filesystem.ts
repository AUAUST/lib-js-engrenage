import type { FileFormatter } from "#foundation/filesystem/types/FileFormatter";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Files } from "#types/Files";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";
import type { SyncResults } from "#types/SyncResults";

/**
 * Paths resolve against the project root; a path escaping it throws.
 *
 * @experimental
 */
export interface Filesystem {
  /**
   * The file's staged content, otherwise its content on disk, cached after the
   * first read; `undefined` when the file is missing or staged for removal.
   */
  read(file: File): Promise<string | undefined>;
  /**
   * Whether `read` finds content for the file, staged writes and removals
   * included.
   */
  exists(file: File): Promise<boolean>;
  /**
   * Whether the directory exists on disk or holds a staged file; `false` when
   * missing.
   */
  isDirectory(directory: Directory): Promise<boolean>;
  /**
   * Stages the content, leaving the disk untouched until `flush`. Staging a
   * file's original content back drops its change.
   */
  write(file: File, content: string): Promise<void>;
  /**
   * Stages the file's removal, leaving the disk untouched until `flush`. Removing
   * a missing file stages no change.
   */
  remove(file: File): Promise<void>;
  /**
   * Files matching `patterns` on disk or staged, without those staged for removal,
   * as sorted root-relative POSIX paths. `exclude` drops files matching it or
   * lying in a directory matching it.
   */
  glob(patterns: Glob | Globs, options?: { exclude?: Globs }): Promise<Files>;
  /**
   * Files in the directory on disk or staged, without those staged for removal,
   * as sorted root-relative POSIX paths; empty when the directory is missing.
   * Recurses unless `recursive` is `false`, skipping subdirectories matching
   * `skip`.
   */
  list(
    directory: Directory,
    options?: { skip?: Globs; recursive?: boolean },
  ): Promise<Files>;
  /**
   * Passes each changed file still present to `formatter` with its absolute path,
   * and stages the content it returns; `undefined` keeps the file as it is.
   */
  format(formatter: FileFormatter): Promise<void>;
  /**
   * One result per staged change, in staging order, compared with the content
   * first read: `created`, `synced` or `deleted`.
   */
  changes(): SyncResults;
  /**
   * Drops every staged change, returning them as `changes` lists them.
   */
  discard(): SyncResults;
  /**
   * Writes the staged changes to disk, creating missing directories, then clears
   * and returns them.
   *
   * @throws When a write fails, after restoring the files already written; the
   * changes stay staged.
   */
  flush(): Promise<SyncResults>;
}
