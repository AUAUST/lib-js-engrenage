import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import { map } from "@auaust/primitive-kit/arrays";

import { coverageDirectory } from "#config/constants";
import { filesIn } from "#eslint/utils/filesIn";
import type { Config } from "#eslint/types/Config";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function createIgnoreRules({
  gitignorePath,
  generatedFiles,
  outputDirectory,
  fixtureFiles,
  testDirectories,
}: {
  gitignorePath: File | undefined;
  generatedFiles: Globs;
  outputDirectory: Directory | undefined;
  fixtureFiles: Glob;
  testDirectories: Directories;
}): Config[] {
  const fixtures = map(testDirectories, (directory) => {
    return filesIn(directory, fixtureFiles);
  });

  const ignores = [
    ...generatedFiles,
    `${coverageDirectory}/**`,
    ...(outputDirectory === undefined ? [] : [`${outputDirectory}/**`]),
    ...fixtures,
  ];

  return defineConfig([
    ...(gitignorePath === undefined ? [] : [includeIgnoreFile(gitignorePath)]),
    globalIgnores(ignores),
  ]);
}
