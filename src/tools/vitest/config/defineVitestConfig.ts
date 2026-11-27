import { createDefiner, type LoadedConfig } from "#project/config/index";
import { createViteConfigFn, type ConfigEnv } from "#tools/vite/index";
import { createVitestLayer } from "#tools/vitest/operations/createVitestLayer";
import type { Config } from "#tools/vitest/types/Config";
import type { ConfigFn } from "#tools/vitest/types/ConfigFn";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

/**
 * Returns a Vite config function adding engrenage's Vitest config to the Vite
 * config, then merging `configs` over it in order. `.at(root)` roots both at the
 * project holding `root`, a directory or a file URL such as `import.meta.url`.
 */
export const defineVitestConfig = createDefiner(defineVitestConfigAt);

function defineVitestConfigAt(
  load: () => Promise<LoadedConfig>,
  options?: Resolvable<Options, [LoadedConfig, ConfigEnv]>,
  ...configs: readonly Resolvable<Config, [LoadedConfig, ConfigEnv]>[]
): ConfigFn {
  return createViteConfigFn(
    load,
    {
      test: createVitestLayer(options),
    },
    ...configs,
  );
}
