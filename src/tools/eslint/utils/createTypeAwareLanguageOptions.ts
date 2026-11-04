import type { Linter } from "eslint";

import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";

export function createTypeAwareLanguageOptions(
  config: ResolvedConfig,
): Linter.LanguageOptions {
  return {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: config.root,
    },
  };
}
