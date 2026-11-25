import type { Directories } from "#types/Directories";

/**
 * A root key of a mirrored `tests` environment and the directories below it
 * mirrors: each directory name of a namespace spanning several directories,
 * its name otherwise.
 *
 * @experimental
 */
export interface MirrorRoot {
  readonly key: string;
  readonly namespace: string;
  readonly dirs: Directories;
}
