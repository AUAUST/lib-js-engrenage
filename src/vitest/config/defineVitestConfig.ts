import { value } from "@auaust/toolkit/value";
import { mergeConfig } from "vitest/config";

import { loadConfig } from "#config/utils/loadConfig";
import { createVitestConfig } from "#vitest/config/createVitestConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { Config } from "#vitest/types/Config";
import type { ConfigFn } from "#vitest/types/ConfigFn";
import type { Options } from "#vitest/types/Options";

export function defineVitestConfig(
  options?: ConfigInput<Options, [ConfigEnv, ResolvedConfig]>,
  ...configs: ConfigInput<Config, [ConfigEnv, ResolvedConfig]>[]
): ConfigFn {
  return async function vitestConfig(env) {
    const config = await loadConfig();

    const resolvedOptions = await value(options, env, config);

    let merged: Config = createVitestConfig(config, env, resolvedOptions);

    for (const nativeConfig of configs) {
      const resolvedNativeConfig = await value(nativeConfig, env, config);

      merged = mergeConfig(merged, resolvedNativeConfig ?? {});
    }

    return merged;
  };
}
