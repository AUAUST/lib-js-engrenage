import type { Linter } from "eslint";

import type { ProjectConfig } from "#project/config/types/ProjectConfig";

export function createTypeAwareLanguageOptions(
  config: ProjectConfig,
): Linter.LanguageOptions {
  return {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: config.root,
    },
  };
}
