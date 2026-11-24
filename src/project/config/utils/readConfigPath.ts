import { getPath } from "@auaust/toolkit/object";

import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";

export async function readConfigPath(
  config: Resolver<ConfigContext>,
  path: string,
): Promise<unknown> {
  const [key = "", ...rest] = path.split(".");

  return getPath(await config.resolve(key), rest);
}
