import { runSync } from "#project/sync/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Runs the `blocks` target and returns the staged content of `file`, discarding
 * every staged change.
 */
export async function fillBlocks(
  config: LoadedConfig,
  file: File,
): Promise<string | undefined> {
  await runSync(config, { names: ["blocks"] });

  const staged = await config.context.filesystem.read(file);

  config.context.filesystem.discard();

  return staged;
}
