import { value } from "@auaust/toolkit/value";

import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
import type { ConfigContext } from "#project/config/index";
import type { ConfigEnv, ConfigLayer } from "#tools/vite/index";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

export function createVitestLayer(
  options?: Resolvable<Options, [ConfigContext, ConfigEnv]>,
): ConfigLayer {
  return async function vitestLayer(config, env) {
    const resolvedOptions = await value(options, config, env);

    return createVitestConfig(config, env, resolvedOptions);
  };
}
