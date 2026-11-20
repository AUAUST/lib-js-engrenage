import { filesIn, relativeWithin } from "#foundation/filesystem/index";
import { environmentDeclarationsFile } from "#project/tsconfig/index";
import type { ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The ambient declarations file of `src`, at the root of its first directory;
 * `undefined` when `src` has no directory.
 */
export async function resolveSourceDeclarationsFile(
  config: ConfigResolver,
): Promise<File | undefined> {
  const { dirs } = await config.resolve("src");

  const [file] = filesIn(dirs.slice(0, 1), environmentDeclarationsFile);

  return file == null ? undefined : relativeWithin(config.context.root, file);
}
