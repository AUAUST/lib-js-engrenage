import { value } from "@auaust/toolkit/value";
import { mergeConfig } from "tsdown";

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
  options?: ConfigInput<Options, [InlineConfig, ConfigContext, ResolvedConfig]>,
  ...configs: Config[]
): ConfigFn {
  return async function tsdownConfig(inlineConfig, context) {
    const config = await loadConfig();

    const resolvedOptions = await value(options, inlineConfig, context, config);

    return mergeConfig(
      createTsdownConfig(
        config,
        {
          ci: context.ci,
        },
        resolvedOptions,
      ),
      ...configs,
    );
  };
}
