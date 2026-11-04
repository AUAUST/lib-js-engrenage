import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Paths } from "#project/tsconfig/types/Paths";
import type { File } from "#types/File";

export function readTsconfigPaths(config: ResolvedConfig, file: File): Paths {
  const current = config.filesystem.read(file);

  const paths =
    current === undefined
      ? undefined
      : readJsonValue(current, file, ["compilerOptions", "paths"]);

  // @debt hand-written paths are cast instead of validated against a schema
  return paths === undefined ? {} : (paths as Paths);
}
