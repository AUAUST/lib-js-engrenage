import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { filesIn } from "#utils/filesIn";
import type { Config } from "#eslint/types/Config";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob, Globs } from "#types/Glob";

export function createIgnoreRules({
  root,
  gitignore,
  generatedFiles,
  fixtureFiles,
  testDirectories,
}: {
  root: Directory | URL;
  gitignore: File;
  generatedFiles: Globs;
  fixtureFiles: Glob;
  testDirectories: Directory[];
}): Config[] {
  const fixtures = map(testDirectories, (directory) => {
    return filesIn(directory, fixtureFiles);
  });

  const ignores = [...generatedFiles, ...fixtures];

  return defineConfig([
    includeIgnoreFile(resolveWithin(root, gitignore)),
    ...(ignores.length > 0 ? [globalIgnores(ignores)] : []),
  ]);
}
