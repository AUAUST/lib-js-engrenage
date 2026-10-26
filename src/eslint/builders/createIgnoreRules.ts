import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import { filesIn } from "#utils/filesIn";
import type { Config } from "#eslint/types/Config";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";

export function createIgnoreRules({
  gitignorePath,
  generatedFiles,
  fixtureFiles,
  testDirectories,
}: {
  gitignorePath: File | undefined;
  generatedFiles: readonly Glob[];
  fixtureFiles: Glob;
  testDirectories: readonly Directory[];
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
