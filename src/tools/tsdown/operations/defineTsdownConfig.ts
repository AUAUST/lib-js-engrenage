import { mergeConfig } from "tsdown";

import { value } from "@auaust/toolkit/value";

import {
  loadConfig,
  type ConfigContext as ProjectContext,
} from "#project/config/index";
import { createTsdownConfig } from "#tools/tsdown/operations/createTsdownConfig";
import type { Config } from "#tools/tsdown/types/Config";
import type { ConfigContext } from "#tools/tsdown/types/ConfigContext";
import type { ConfigFn } from "#tools/tsdown/types/ConfigFn";
import type { InlineConfig } from "#tools/tsdown/types/InlineConfig";
import type { Options } from "#tools/tsdown/types/Options";
import type { Resolvable } from "#types/Resolvable";

export function defineTsdownConfig(
  options?: Resolvable<Options, [ProjectContext, InlineConfig, ConfigContext]>,
  ...configs: readonly Resolvable<
    Config,
    [ProjectContext, InlineConfig, ConfigContext]
  >[]
): ConfigFn {
  return async function tsdownConfig(inlineConfig, context) {
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
