import { value } from "@auaust/toolkit/value";

import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
import type { LoadedConfig } from "#project/config/index";
import type { ConfigEnv, ConfigLayer } from "#tools/vite/index";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

/**
 * Returns a config layer producing engrenage's Vitest config, with `options`
 * resolved on each call.
 */
export function createVitestLayer(
  options?: Resolvable<Options, [LoadedConfig, ConfigEnv]>,
): ConfigLayer {
  return async function vitestLayer(config, env) {
    const resolvedOptions = await value(options, config, env);

    return createVitestConfig(config, env, resolvedOptions);
  };
}
