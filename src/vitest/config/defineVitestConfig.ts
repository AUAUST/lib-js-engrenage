import { defineViteConfig } from "#vite/config/defineViteConfig";
import { createVitestLayer } from "#vitest/utils/createVitestLayer";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { ConfigInput } from "#types/ConfigInput";
import type { ConfigEnv } from "#vite/types/ConfigEnv";
import type { Config } from "#vitest/types/Config";
import type { ConfigFn } from "#vitest/types/ConfigFn";
import type { Options } from "#vitest/types/Options";

export function defineVitestConfig(
  options?: ConfigInput<Options, [ResolvedConfig, ConfigEnv]>,
  ...configs: readonly ConfigInput<Config, [ResolvedConfig, ConfigEnv]>[]
): ConfigFn {
  return defineViteConfig(
    {
      test: createVitestLayer(options),
    },
    ...configs,
  );
}
