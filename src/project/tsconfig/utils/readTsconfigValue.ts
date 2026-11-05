import { readJsonValue } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export async function readTsconfigValue(
  config: LoadedConfig,
  { file }: TsconfigTarget,
  location: readonly string[],
): Promise<unknown> {
  const filesystem = config.context.filesystem;

  const content = await filesystem.read(file);

  return content === undefined
    ? undefined
    : readJsonValue(content, file, [...location]);
}
