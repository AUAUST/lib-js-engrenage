import type { Linter } from "eslint";

import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";

export function createTypeAwareLanguageOptions(
  config: ConventionConfig,
): Linter.LanguageOptions {
  return {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: config.root,
    },
  };
}
