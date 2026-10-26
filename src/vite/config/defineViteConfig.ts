import { value } from "@auaust/toolkit/value";
import { mergeConfig } from "vite";

import { loadConfig } from "#config/utils/loadConfig";
import { createViteConfig } from "#vite/builders/createViteConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { Config } from "#vite/types/Config";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { ConfigFn } from "#vite/types/ConfigFn";

export function defineViteConfig(
  nativeConfig?: ConfigInput<Config, [ConfigEnv, ResolvedConfig]>,
): ConfigFn {
  return async function viteConfig(env) {
    const config = await loadConfig();

    const resolvedNativeConfig = await value(nativeConfig, env, config);

    return mergeConfig(createViteConfig(config), resolvedNativeConfig ?? {});
  };
}
