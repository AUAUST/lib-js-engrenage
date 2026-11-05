import { defineViteConfig } from "#tools/vite/index";
import { createVitestLayer } from "#tools/vitest/operations/createVitestLayer";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { Config } from "#tools/vitest/types/Config";
import type { ConfigFn } from "#tools/vitest/types/ConfigFn";
import type { Options } from "#tools/vitest/types/Options";
import type { Resolvable } from "#types/Resolvable";

export function defineVitestConfig(
  options?: Resolvable<Options, [ProjectConfig, ConfigEnv]>,
  ...configs: readonly Resolvable<Config, [ProjectConfig, ConfigEnv]>[]
): ConfigFn {
  return defineViteConfig(
    {
      test: createVitestLayer(options),
    },
    ...configs,
  );
}
