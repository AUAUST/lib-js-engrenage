import type { Config } from "#eslint/types/Config";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";

export function createIgnoreRules({
  root,
  gitignore,
  generatedFiles,
}: {
  root: Directory | URL;
  gitignore: File;
  generatedFiles: Glob[];
}): Config[] {
  const generatedIgnores =
    generatedFiles.length > 0 ? [globalIgnores(generatedFiles)] : [];

  return defineConfig([
    includeIgnoreFile(resolveWithin(root, gitignore)),
    ...generatedIgnores,
  ]);
}
