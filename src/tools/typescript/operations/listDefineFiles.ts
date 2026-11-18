import { relativeWithin } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * The env file the `@define` directive fills, while defined globals are typed.
 */
export async function listDefineFiles(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const [{ types }, { envFile }] = await Promise.all([
    config.resolve("define"),
    config.resolve("typescript"),
  ]);

  return types ? [relativeWithin(config.context.root, envFile)] : [];
}
