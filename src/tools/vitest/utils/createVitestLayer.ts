import { value } from "@auaust/toolkit/value";

import { createVitestConfig } from "#vitest/config/createVitestConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { ConfigLayer } from "#vite/types/ConfigLayer";
import type { Options } from "#vitest/types/Options";

export function createVitestLayer(
  options?: ConfigInput<Options, [ResolvedConfig, ConfigEnv]>,
): ConfigLayer {
  return async function vitestLayer(config, env) {
    const resolvedOptions = await value(options, config, env);

    return createVitestConfig(config, env, resolvedOptions);
  };
}
