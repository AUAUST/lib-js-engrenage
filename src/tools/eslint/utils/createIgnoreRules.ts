import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import { map } from "@auaust/toolkit/array";

import type { Config } from "#tools/eslint/types/Config";
import type { Directory } from "#types/Directory";
import type { Files } from "#types/Files";
import type { Globs } from "#types/Globs";

export function createIgnoreRules(config: {
  ignoreFiles: Files;
  excludeFiles: Files;
  root: Directory;
  ignored: Globs;
}): Config[] {
  return defineConfig([
    includeIgnoreFile([...config.ignoreFiles], {
      gitignoreResolution: true,
    }),
    map(includeIgnoreFile([...config.excludeFiles]), (ignores) => {
      return {
        ...ignores,
        basePath: config.root,
      };
    }),
    globalIgnores([...config.ignored]),
  ]);
}
