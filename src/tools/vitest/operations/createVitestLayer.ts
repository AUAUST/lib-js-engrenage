import { value } from "@auaust/toolkit/value";

import { createContext } from "#project/config/utils/createContext";
import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { ConfigLayer } from "#tools/vite/types/ConfigLayer";
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
