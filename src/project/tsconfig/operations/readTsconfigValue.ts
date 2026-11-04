import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

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
