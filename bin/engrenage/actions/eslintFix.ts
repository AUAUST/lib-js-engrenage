import { resolveEslintFixArguments } from "#tools/eslint/index";
import type { LoadedConfig } from "#workflows/config/index";

export default function (
  args: string[],
  config: LoadedConfig,
): Promise<readonly string[]> {
  return resolveEslintFixArguments(args, config);
}
