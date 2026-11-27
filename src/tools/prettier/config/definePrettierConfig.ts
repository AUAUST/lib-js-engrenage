import { value } from "@auaust/toolkit";

import { createDefiner, type LoadedConfig } from "#project/config/index";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";
import type { Resolvable } from "#types/Resolvable";

/**
 * Builds the Prettier config of the project in the current working directory,
 * with `options`, resolved with the loaded config, overriding engrenage's
 * options. `.at(root)` loads the config of the project holding `root` instead,
 * a directory or a file URL such as `import.meta.url`.
 */
// eslint-disable-next-line auaust/import-effects -- #986
export const definePrettierConfig = createDefiner(definePrettierConfigAt);

async function definePrettierConfigAt(
  load: () => Promise<LoadedConfig>,
  options?: Resolvable<Config, [LoadedConfig]>,
): Promise<Config> {
  const config = await load();

  const resolvedOptions = await value(options, config);

  return createPrettierConfig(config, resolvedOptions ?? undefined);
}
