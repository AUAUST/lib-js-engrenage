import { deriveInfoRules } from "#tools/eslint/operations/deriveInfoRules";
import { loadEslintConfigs } from "#tools/eslint/operations/loadEslintConfigs";
import type { Directory } from "#types/Directory";

/**
 * Lists, sorted, the rules the project's ESLint config sets to `info` in its
 * last config object setting them; without a config file, reads engrenage's
 * default config instead.
 */
export async function loadInfoRules(root: Directory): Promise<string[]> {
  return deriveInfoRules(await loadEslintConfigs(root));
}
