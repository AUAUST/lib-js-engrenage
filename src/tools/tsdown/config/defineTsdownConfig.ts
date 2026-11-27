import { mergeConfig } from "tsdown";

import { value } from "@auaust/toolkit";

import { createDefiner, type LoadedConfig } from "#project/config/index";
import { createTsdownConfig } from "#tools/tsdown/operations/createTsdownConfig";
import type { Config } from "#tools/tsdown/types/Config";
import type { ConfigContext } from "#tools/tsdown/types/ConfigContext";
import type { ConfigFn } from "#tools/tsdown/types/ConfigFn";
import type { InlineConfig } from "#tools/tsdown/types/InlineConfig";
import type { Options } from "#tools/tsdown/types/Options";
import type { Resolvable } from "#types/Resolvable";

/**
 * Returns a tsdown config function building the config of the project in the
 * current working directory, then merging `configs` over it in order. `options`
 * and `configs` resolve with the loaded config and tsdown's inline config and
 * context. `.at(root)` loads the config of the project holding `root` instead,
 * a directory or a file URL such as `import.meta.url`.
 */
// eslint-disable-next-line auaust/import-effects -- #986
export const defineTsdownConfig = createDefiner(defineTsdownConfigAt);

function defineTsdownConfigAt(
  load: () => Promise<LoadedConfig>,
  options?: Resolvable<Options, [LoadedConfig, InlineConfig, ConfigContext]>,
  ...configs: readonly Resolvable<
    Config,
    [LoadedConfig, InlineConfig, ConfigContext]
  >[]
): ConfigFn {
  return async function tsdownConfig(inlineConfig, context) {
    const config = await load();

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
