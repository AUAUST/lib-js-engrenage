import { value } from "@auaust/toolkit/value";

import { loadConfig, type LoadedConfig } from "#project/config/index";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";
import type { Resolvable } from "#types/Resolvable";

export async function definePrettierConfig(
  options?: Resolvable<Config, [LoadedConfig]>,
): Promise<Config> {
  const config = await loadConfig();

  const resolvedOptions = await value(options, config);

  return createPrettierConfig(config, resolvedOptions ?? undefined);
}
