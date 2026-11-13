import { defineViteConfig, type ConfigEnv } from "#tools/vite/index";
import { createVitestLayer } from "#tools/vitest/operations/createVitestLayer";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vitest/types/Config";
import type { ConfigFn } from "#tools/vitest/types/ConfigFn";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

/**
 * Returns a Vite config function adding engrenage's Vitest config to the Vite
 * config, then merging `configs` over it in order.
 */
export function defineVitestConfig(
  options?: Resolvable<Options, [LoadedConfig, ConfigEnv]>,
  ...configs: readonly Resolvable<Config, [LoadedConfig, ConfigEnv]>[]
): ConfigFn {
  return defineViteConfig(
    {
      test: createVitestLayer(options),
    },
    ...configs,
  );
}
