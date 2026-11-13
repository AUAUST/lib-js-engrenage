import { value } from "@auaust/toolkit/value";

import { loadConfig, type LoadedConfig } from "#project/config/index";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";
import type { Resolvable } from "#types/Resolvable";

/**
 * Builds the Prettier config of the project in the current working directory, with
 * `options`, resolved with the loaded config, overriding engrenage's options.
 */
export async function definePrettierConfig(
  options?: Resolvable<Config, [LoadedConfig]>,
): Promise<Config> {
  // @debt loads the config of `process.cwd()`, not of the project owning this tool config file (backlog configuration.13)
  const config = await loadConfig();

  const resolvedOptions = await value(options, config);

  return createPrettierConfig(config, resolvedOptions ?? undefined);
}
