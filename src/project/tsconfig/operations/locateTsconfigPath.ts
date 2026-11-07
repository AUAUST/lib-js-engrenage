import { locateFile, type ConfigContext } from "#project/config/index";
import { typescriptOptionsSection } from "#project/tsconfig/config/sections/typescriptOptionsSection";
import type { Resolver } from "#foundation/options/index";
import type { File } from "#types/File";

export async function locateTsconfigPath(
  config: Resolver<ConfigContext>,
): Promise<File | undefined> {
  const { tsconfig } = await config.resolve(typescriptOptionsSection);

  const { file, configured } = tsconfig.path;

  return locateFile(config.context, file, configured);
}
