import { value } from "@auaust/toolkit/value";
import { mergeConfig } from "vitest/config";

import { loadConfig } from "#config/utils/loadConfig";
import { createVitestConfig } from "#vitest/builders/createVitestConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { Config } from "#vitest/types/Config";
import type { ConfigFn } from "#vitest/types/ConfigFn";
import type { Options } from "#vitest/types/Options";

export function defineVitestConfig(
  nativeConfig?: ConfigInput<Config, [ConfigEnv, ResolvedConfig]>,
  options?: ConfigInput<Options, [ResolvedConfig]>,
): ConfigFn {
  return async function vitestConfig(env) {
    const config = await loadConfig();

    const resolvedOptions = await value(options, config);

    const resolvedNativeConfig = await value(nativeConfig, env, config);

    return mergeConfig(
      createVitestConfig(config, env, resolvedOptions),
      resolvedNativeConfig ?? {},
    );
  };
}
