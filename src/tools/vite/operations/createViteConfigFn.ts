import { mergeConfig } from "vite";

import { value } from "@auaust/toolkit";

import { validate } from "#foundation/options/index";
import { optionsSchema } from "#tools/vite/config/schemas/optionsSchema";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";
import type { LoadedConfig } from "#project/config/index";
import type { Config } from "#tools/vite/types/Config";
import type { ConfigEnv } from "#tools/vite/types/ConfigEnv";
import type { ConfigFn } from "#tools/vite/types/ConfigFn";
import type { Options } from "#tools/vite/types/Options";
import type { Resolvable } from "#types/Resolvable";

/**
 * Returns a Vite config function building the config of the project `load`
 * resolves, then merging the `test` option and `configs` over it in order, each
 * resolved with the loaded config and Vite's config env.
 *
 * @throws {Error} No layer sets `root` where engrenage leaves it unset, the src
 * environment having several directories.
 */
export function createViteConfigFn(
  load: () => Promise<LoadedConfig>,
  options?: Resolvable<Options, [LoadedConfig, ConfigEnv]>,
  ...configs: readonly Resolvable<Config, [LoadedConfig, ConfigEnv]>[]
): ConfigFn {
  return async function viteConfig(env) {
    const config = await load();

    const resolvedOptions = await value(options, config, env);

    const {
      test,
    } = validate(optionsSchema, resolvedOptions ?? {}, "Vite options");

    let merged: Config = await createViteConfig(config, {
      isTesting: process.env.VITEST === "true",
    });

    const testConfig = await value(test, config, env);

    merged = mergeConfig(merged, testConfig ?? {});

    for (const nativeConfig of configs) {
      const resolvedNativeConfig = await value(nativeConfig, config, env);

      merged = mergeConfig(merged, resolvedNativeConfig ?? {});
    }

    // @debt The failure infers its cause from createViteConfig leaving root unset only for several src.dirs, a contract no type carries.
    if (merged.root === undefined) {
      throw new Error(
        `Several src.dirs in ${config.context.root}, so Vite has no single root: set root in the native Vite config layer`,
      );
    }

    return merged;
  };
}
