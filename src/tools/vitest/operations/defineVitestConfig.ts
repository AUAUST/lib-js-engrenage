import { defineViteConfig } from "#tools/vite/operations/defineViteConfig";
import { createVitestLayer } from "#tools/vitest/operations/createVitestLayer";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { Config } from "#tools/vitest/types/Config";
import type { ConfigFn } from "#tools/vitest/types/ConfigFn";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

export function defineVitestConfig(
  options?: Resolvable<Options, [ResolvedConfig, ConfigEnv]>,
  ...configs: readonly Resolvable<Config, [ResolvedConfig, ConfigEnv]>[]
): ConfigFn {
  return defineViteConfig(
    {
      test: createVitestLayer(options),
    },
    ...configs,
  );
}
