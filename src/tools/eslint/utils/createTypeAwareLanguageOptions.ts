import type { Linter } from "eslint";

import type { Directory } from "#types/Directory";

export function createTypeAwareLanguageOptions(
  root: Directory,
): Linter.LanguageOptions {
  return {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: root,
    },
  };
}
