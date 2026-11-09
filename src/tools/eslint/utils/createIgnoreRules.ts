import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import type { Config } from "#tools/eslint/types/Config";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export function createIgnoreRules(config: {
  gitignorePath: File | undefined;
  ignored: Globs;
}): Config[] {
  return defineConfig([
    ...(config.gitignorePath === undefined
      ? []
      : [includeIgnoreFile(config.gitignorePath)]),
    globalIgnores([...config.ignored]),
  ]);
}
