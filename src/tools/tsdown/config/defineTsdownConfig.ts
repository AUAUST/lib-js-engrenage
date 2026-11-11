import { mergeConfig } from "tsdown";

import { value } from "@auaust/toolkit/value";

import { loadConfig, type LoadedConfig } from "#project/config/index";
import { createTsdownConfig } from "#tools/tsdown/operations/createTsdownConfig";
import type { Config } from "#tools/tsdown/types/Config";
import type { ConfigContext } from "#tools/tsdown/types/ConfigContext";
import type { ConfigFn } from "#tools/tsdown/types/ConfigFn";
import type { InlineConfig } from "#tools/tsdown/types/InlineConfig";
import type { Options } from "#tools/tsdown/types/Options";
import type { Resolvable } from "#types/Resolvable";

export function defineTsdownConfig(
  options?: Resolvable<Options, [LoadedConfig, InlineConfig, ConfigContext]>,
  ...configs: readonly Resolvable<
    Config,
    [LoadedConfig, InlineConfig, ConfigContext]
  >[]
): ConfigFn {
  return async function tsdownConfig(inlineConfig, context) {
    // @debt loads the config of `process.cwd()`, not of the project owning this tool config file (backlog configuration.13)
    const config = await loadConfig();

    const resolvedOptions = await value(options, config, inlineConfig, context);

    const resolvedConfigs: Config[] = [];

    for (const nativeConfig of configs) {
      const resolvedConfig = await value(
        nativeConfig,
        config,
        inlineConfig,
        context,
      );

      resolvedConfigs.push(resolvedConfig ?? {});
    }

    return mergeConfig(
      await createTsdownConfig(
        config,
        {
          ci: context.ci,
        },
        resolvedOptions,
      ),
      ...resolvedConfigs,
    );
  };
}
