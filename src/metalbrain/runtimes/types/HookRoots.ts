import type { File } from "#types/File";

/**
 * The markers ending a hook command's walk up to the project root: the
 * `repository` entry, a directory or a file, and the `workspace` file.
 */
export interface HookRoots {
  readonly repository: string;
  readonly workspace: File;
}
