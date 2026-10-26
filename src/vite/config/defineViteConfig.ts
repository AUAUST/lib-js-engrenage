import { value } from "@auaust/toolkit/value";
import { mergeConfig } from "vite";

import { loadConfig } from "#config/utils/loadConfig";
import { createViteConfig } from "#vite/config/createViteConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { Config } from "#vite/types/Config";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { ConfigFn } from "#vite/types/ConfigFn";

export function defineViteConfig(
  ...configs: ConfigInput<Config, [ConfigEnv, ResolvedConfig]>[]
): ConfigFn {
  return async function viteConfig(env) {
    const config = await loadConfig();

    let merged: Config = createViteConfig(config);

    for (const nativeConfig of configs) {
      const resolvedNativeConfig = await value(nativeConfig, env, config);

      merged = mergeConfig(merged, resolvedNativeConfig ?? {});
    }

    return merged;
  };
}
