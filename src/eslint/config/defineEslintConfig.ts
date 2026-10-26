import { defineConfig } from "eslint/config";

import { value } from "@auaust/toolkit/value";

import { loadConfig } from "#config/utils/loadConfig";
import { createEslintConfig } from "#eslint/config/createEslintConfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Config } from "#eslint/types/Config";
import type { ConfigWithExtends } from "#eslint/types/ConfigWithExtends";
import type { Options } from "#eslint/types/Options";
import type { ConfigInput } from "#types/ConfigInput";

export async function defineEslintConfig(
  options?: ConfigInput<Options, [ResolvedConfig]>,
  ...configs: ConfigInput<ConfigWithExtends, [ResolvedConfig]>[]
): Promise<Config[]> {
  const config = await loadConfig();

  const resolvedOptions = await value(options, config);

  const resolvedConfigs: ConfigWithExtends[] = [];

  for (const nativeConfig of configs) {
    const resolvedConfig = await value(nativeConfig, config);

    resolvedConfigs.push(resolvedConfig ?? []);
  }

  return defineConfig(
    createEslintConfig(config, resolvedOptions),
    ...resolvedConfigs,
  );
}
