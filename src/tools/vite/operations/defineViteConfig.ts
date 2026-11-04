import { mergeConfig } from "vite";

import { value } from "@auaust/toolkit/value";

import { validate } from "#foundation/options/utils/validate";
import { loadConfig } from "#project/config/operations/loadConfig";
import { optionsSchema } from "#tools/vite/config/schemas/optionsSchema";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { ConfigFn } from "#tools/vite/types/ConfigFn";
import type { Options } from "#tools/vite/types/Options";
import type { ConfigInput } from "#types/ConfigInput";

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
