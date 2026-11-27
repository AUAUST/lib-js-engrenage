import { defineConfig } from "eslint/config";

import { iterable, value } from "@auaust/toolkit";

import { createDefiner, type LoadedConfig } from "#project/config/index";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import type { Config } from "#tools/eslint/types/Config";
import type { ConfigWithExtends } from "#tools/eslint/types/ConfigWithExtends";
import type { Options } from "#tools/eslint/types/Options";
import type { Resolvable } from "#types/Resolvable";

/**
 * Builds the ESLint config of the project in the current working directory from
 * engrenage's options, then appends `configs`, each resolved with the loaded
 * config. Rule entries set to `info` in `configs` are reported as warnings and
 * listed as info rules. `.at(root)` loads the config of the project holding
 * `root` instead, a directory or a file URL such as `import.meta.url`.
 */
// eslint-disable-next-line auaust/import-effects -- #986
export const defineEslintConfig = createDefiner(defineEslintConfigAt);

async function defineEslintConfigAt(
  load: () => Promise<LoadedConfig>,
  options?: Resolvable<Options, [LoadedConfig]>,
  ...configs: Resolvable<ConfigWithExtends, [LoadedConfig]>[]
): Promise<Config[]> {
  const config = await load();

  const resolvedOptions = await value(options, config);

  const resolvedConfigs: ConfigWithExtends[] = [];

  for (const nativeConfig of configs) {
    const resolvedConfig = await value(nativeConfig, config);

    resolvedConfigs.push(resolvedConfig ?? []);
  }

  return defineConfig(
    await createEslintConfig(config, resolvedOptions),
    ...iterable.map(resolvedConfigs, resolveInfoRules),
  );
}
