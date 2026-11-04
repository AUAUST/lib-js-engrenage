import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export function readTsconfigValue(
  config: ProjectConfig,
  { file }: TsconfigTarget,
  location: readonly string[],
): unknown {
  const content = config.filesystem.read(file);

  return content === undefined
    ? undefined
    : readJsonValue(content, file, [...location]);
}
