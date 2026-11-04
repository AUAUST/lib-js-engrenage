import { value } from "@auaust/toolkit/value";

import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { ConfigLayer } from "#tools/vite/types/ConfigLayer";
import type { Options } from "#tools/vitest/types/Options";
import type { ConfigInput } from "#types/ConfigInput";

export function createVitestLayer(
  options?: ConfigInput<Options, [ResolvedConfig, ConfigEnv]>,
): ConfigLayer {
  return async function vitestLayer(config, env) {
    const resolvedOptions = await value(options, config, env);

    return createVitestConfig(config, env, resolvedOptions);
  };
}
