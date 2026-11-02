import { readJsonValue } from "#support/json/utils/readJsonValue";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

export function readTsconfigValue(
  config: ResolvedConfig,
  { file }: TsconfigTarget,
  location: readonly string[],
): unknown {
  const content = config.filesystem.read(file);

  return content === undefined
    ? undefined
    : readJsonValue(content, file, [...location]);
}
