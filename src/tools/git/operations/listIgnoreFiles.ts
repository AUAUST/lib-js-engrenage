import { locateIgnoreFiles } from "#tools/git/operations/locateIgnoreFiles";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The path, relative to the root, of each `ignore.files` contribution whose
 * resource is located.
 */
export async function listIgnoreFiles(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const located = await locateIgnoreFiles(config);

  return located.map(({ file }) => file);
}
