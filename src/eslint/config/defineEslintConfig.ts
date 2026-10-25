import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import { loadConfig } from "#config/utils/loadConfig";
import { createEslintConfig } from "#eslint/builders/createEslintConfig";
import type { Config } from "#eslint/types/Config";
import type { ConfigWithExtends } from "#eslint/types/ConfigWithExtends";
import type { Options } from "#eslint/types/Options";
import type { ConfigInput } from "#types/ConfigInput";
import { resolveConfigInput } from "#utils/resolveConfigInput";
import { defineConfig } from "eslint/config";

export async function defineEslintConfig(
  options?: ConfigInput<Options, [ResolvedConfig]>,
  ...configs: ConfigWithExtends[]
): Promise<Config[]> {
  const config = await loadConfig();

  const resolvedOptions = await resolveConfigInput(options, config);

  return defineConfig(createEslintConfig(config, resolvedOptions), ...configs);
}
