import { readJsonValue } from "#foundation/json/index";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";

export async function readTsconfigValue(
  config: ConfigContext,
  { file }: TsconfigTarget,
  location: readonly string[],
): Promise<unknown> {
  const filesystem = await config.get("filesystem");

  const content = await filesystem.read(file);

  return content === undefined
    ? undefined
    : readJsonValue(content, file, [...location]);
}
