import { typescriptOptionsSection } from "#project/config/operations/typescriptOptionsSection";
import { locateFile } from "#project/config/utils/locateFile";
import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { File } from "#types/File";

export async function locateTsconfigPath(
  config: Resolver<ConfigContext>,
): Promise<File | undefined> {
  const { tsconfig } = await config.resolve(typescriptOptionsSection);

  const { file, configured } = tsconfig.path;

  return locateFile(config.context, file, configured);
}
