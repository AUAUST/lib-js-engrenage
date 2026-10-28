import { mergeConfig } from "vite";

import { value } from "@auaust/toolkit/value";

import { loadConfig } from "#config/utils/loadConfig";
import { validate } from "#utils/validate";
import { createViteConfig } from "#vite/config/createViteConfig";
import { optionsSchema } from "#vite/config/schemas/optionsSchema";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { Config } from "#vite/types/Config";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { ConfigFn } from "#vite/types/ConfigFn";
import type { Options } from "#vite/types/Options";

export function defineViteConfig(
  options?: ConfigInput<Options, [ResolvedConfig, ConfigEnv]>,
  ...configs: readonly ConfigInput<Config, [ResolvedConfig, ConfigEnv]>[]
): ConfigFn {
  return async function viteConfig(env) {
    const config = await loadConfig();

    const resolvedOptions = await value(options, config, env);

    const { test } = validate(
      optionsSchema,
      resolvedOptions ?? {},
      "Vite options",
    );

    let merged: Config = createViteConfig(config, {
      isTesting: process.env.VITEST === "true",
    });

    const testConfig = await value(test, config, env);

    merged = mergeConfig(merged, testConfig ?? {});

    for (const nativeConfig of configs) {
      const resolvedNativeConfig = await value(nativeConfig, config, env);

      merged = mergeConfig(merged, resolvedNativeConfig ?? {});
    }

    return merged;
  };
}
