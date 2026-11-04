import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import type { Config } from "#eslint/types/Config";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export function createIgnoreRules(config: {
  gitignorePath: File | undefined;
  generatedFiles: Globs;
  outputDirectory: Directory | undefined;
  coverageDirectory: Directory;
  fixtureFiles: Globs;
}): Config[] {
  const ignores = [
    ...config.generatedFiles,
    `${config.coverageDirectory}/**`,
    ...(config.outputDirectory === undefined
      ? []
      : [`${config.outputDirectory}/**`]),
    ...config.fixtureFiles,
  ];

  return defineConfig([
    ...(config.gitignorePath === undefined
      ? []
      : [includeIgnoreFile(config.gitignorePath)]),
    globalIgnores(ignores),
  ]);
}
