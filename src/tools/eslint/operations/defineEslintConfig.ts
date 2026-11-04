import { defineConfig } from "eslint/config";

import { map } from "@auaust/primitive-kit/arrays";
import { value } from "@auaust/toolkit/value";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import { resolveInfoRules } from "#tools/eslint/utils/resolveInfoRules";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Config } from "#tools/eslint/types/Config";
import type { ConfigWithExtends } from "#tools/eslint/types/ConfigWithExtends";
import type { Options } from "#tools/eslint/types/Options";
import type { Resolvable } from "#types/Resolvable";

export async function defineEslintConfig(
  options?: Resolvable<Options, [ProjectConfig]>,
  ...configs: Resolvable<ConfigWithExtends, [ProjectConfig]>[]
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
    ...map(resolvedConfigs, resolveInfoRules),
  );
}
