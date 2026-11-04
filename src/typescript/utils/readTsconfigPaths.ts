import { readJsonValue } from "#support/json/utils/readJsonValue";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import type { Paths } from "#typescript/types/Paths";

export function readTsconfigPaths(config: ResolvedConfig, file: File): Paths {
  const current = config.filesystem.read(file);

  const paths =
    current === undefined
      ? undefined
      : readJsonValue(current, file, ["compilerOptions", "paths"]);

  // @debt hand-written paths are cast instead of validated against a schema
  return paths === undefined ? {} : (paths as Paths);
}
