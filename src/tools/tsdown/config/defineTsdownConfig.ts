import { mergeConfig } from "tsdown";

import { value } from "@auaust/toolkit/value";

import { loadConfig } from "#config/utils/loadConfig";
import { createTsdownConfig } from "#tsdown/config/createTsdownConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#tsdown/types/Config";
import type { ConfigContext } from "#tsdown/types/ConfigContext";
import type { ConfigFn } from "#tsdown/types/ConfigFn";
import type { InlineConfig } from "#tsdown/types/InlineConfig";
import type { Options } from "#tsdown/types/Options";
import type { ConfigInput } from "#types/ConfigInput";

export function defineTsdownConfig(
  options?: ConfigInput<Options, [ResolvedConfig, InlineConfig, ConfigContext]>,
  ...configs: readonly ConfigInput<
    Config,
    [ResolvedConfig, InlineConfig, ConfigContext]
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
      createTsdownConfig(
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
