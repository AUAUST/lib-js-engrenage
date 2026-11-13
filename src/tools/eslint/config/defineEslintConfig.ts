import { defineConfig } from "eslint/config";

import { map } from "@auaust/primitive-kit/arrays";
import { value } from "@auaust/toolkit/value";

import { loadConfig, type LoadedConfig } from "#project/config/index";
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
 * listed as info rules.
 */
export async function defineEslintConfig(
  options?: Resolvable<Options, [LoadedConfig]>,
  ...configs: Resolvable<ConfigWithExtends, [LoadedConfig]>[]
): Promise<Config[]> {
  // @debt loads the config of `process.cwd()`, not of the project owning this tool config file (backlog configuration.13)
  const config = await loadConfig();

  const resolvedOptions = await value(options, config);

  const resolvedConfigs: ConfigWithExtends[] = [];

  for (const nativeConfig of configs) {
    const resolvedConfig = await value(nativeConfig, config);

    resolvedConfigs.push(resolvedConfig ?? []);
  }

  return defineConfig(
    await createEslintConfig(config, resolvedOptions),
    ...map(resolvedConfigs, resolveInfoRules),
  );
}
