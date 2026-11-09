import { locateFile, type ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

export async function locateTsconfigPath(
  config: ConfigResolver,
): Promise<File | undefined> {
  const { tsconfig } = await config.resolve("typescript.options");

  const { file, configured } = tsconfig.path;

  return locateFile(config.context, file, configured);
}
