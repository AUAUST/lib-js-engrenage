import type { File } from "#types/File";

/**
 * A program a hook command runs: its `node_modules/.bin` name, and its
 * executable's `source` in the repository developing it.
 */
export interface HookProgram {
  readonly name: string;
  readonly source: File;
}
