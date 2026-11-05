import { value } from "@auaust/toolkit/value";

import { createContext, type ProjectConfig } from "#project/config/index";
import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
import type { ConfigEnv, ConfigLayer } from "#tools/vite/index";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

export function createVitestLayer(
  options?: Resolvable<Options, [ProjectConfig, ConfigEnv]>,
): ConfigLayer {
  return async function vitestLayer(config, env) {
    const resolvedOptions = await value(options, config, env);

    return createVitestConfig(createContext(config), env, resolvedOptions);
  };
}
