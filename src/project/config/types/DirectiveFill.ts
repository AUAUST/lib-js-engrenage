import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { File } from "#types/File";

/**
 * Content of the block, or `undefined` to keep it.
 *
 * @experimental
 */
export type DirectiveFill = (context: {
  readonly args: readonly string[];
  readonly file: File;
  readonly config: LoadedConfig;
}) => Promise<string | undefined>;
