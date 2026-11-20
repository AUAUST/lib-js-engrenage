import { resolveSourceDeclarationsFile } from "#tools/typescript/operations/resolveSourceDeclarationsFile";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The `src` declarations file the `@define` directive fills, while defined
 * globals are typed.
 */
export async function listDefineFiles(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const { types } = await config.resolve("define");

  const file = types ? await resolveSourceDeclarationsFile(config) : undefined;

  return file === undefined ? [] : [file];
}
