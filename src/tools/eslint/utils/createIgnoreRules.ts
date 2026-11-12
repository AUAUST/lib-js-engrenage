import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import type { Config } from "#tools/eslint/types/Config";
import type { Files } from "#types/Files";
import type { Globs } from "#types/Globs";

export function createIgnoreRules(config: {
  ignoreFiles: Files;
  ignored: Globs;
}): Config[] {
  return defineConfig([
    includeIgnoreFile([...config.ignoreFiles], {
      gitignoreResolution: true,
    }),
    globalIgnores([...config.ignored]),
  ]);
}
