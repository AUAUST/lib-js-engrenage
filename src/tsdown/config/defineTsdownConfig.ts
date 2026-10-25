import { value } from "@auaust/toolkit/value";
import { mergeConfig } from "tsdown";

import { loadConfig } from "#config/utils/loadConfig";
import { createTsdownConfig } from "#tsdown/builders/createTsdownConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#tsdown/types/Config";
import type { ConfigFn } from "#tsdown/types/ConfigFn";
import type { Options } from "#tsdown/types/Options";
import type { ConfigInput } from "#types/ConfigInput";

export function defineTsdownConfig(
  options?: ConfigInput<Options, [ResolvedConfig]>,
  ...configs: Config[]
): ConfigFn {
  return async function tsdownConfig(_, { ci }) {
    const config = await loadConfig();

    const resolvedOptions = await value(options, config);

    return mergeConfig(
      createTsdownConfig(
        config,
        {
          ci,
        },
        resolvedOptions,
      ),
      ...configs,
    );
  };
}
