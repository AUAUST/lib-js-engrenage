import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import { filesIn } from "#eslint/utils/filesIn";
import type { Config } from "#eslint/types/Config";
import type { Directories } from "#types/Directories";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export function createIgnoreRules({
  gitignorePath,
  generatedFiles,
  fixtureFiles,
  testDirectories,
}: {
  gitignorePath: File | undefined;
  generatedFiles: Globs;
  fixtureFiles: Glob;
  testDirectories: Directories;
}): Config[] {
  const fixtures = map(testDirectories, (directory) => {
    return filesIn(directory, fixtureFiles);
  });

  const ignores = [...generatedFiles, ...fixtures];

  return defineConfig([
    ...(gitignorePath === undefined ? [] : [includeIgnoreFile(gitignorePath)]),
    ...(ignores.length > 0 ? [globalIgnores(ignores)] : []),
  ]);
}
