import { readJsonValue } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { Paths } from "#project/tsconfig/types/Paths";
import type { File } from "#types/File";

export async function readTsconfigPaths(
  config: ConfigContext,
  file: File,
): Promise<Paths> {
  const filesystem = await config.get("filesystem");

  const current = filesystem.read(file);

  const paths =
    current === undefined
      ? undefined
      : readJsonValue(current, file, ["compilerOptions", "paths"]);

  // @debt hand-written paths are cast instead of validated against a schema
  return paths === undefined ? {} : (paths as Paths);
}
