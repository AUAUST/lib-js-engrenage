import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import { baseRules } from "#eslint/config/defaults/baseRules";
import type { Config } from "#eslint/types/Config";
import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import js from "@eslint/js";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";
import { getDefault } from "valibot";

export function createBaseRules({
  root,
  ignores = [],
}: {
  root: Directory | URL;
  ignores?: Glob[];
}): Config[] {
  const gitignore = resolve(root, ".gitignore");

  const projectIgnores = ignores.length > 0 ? [globalIgnores(ignores)] : [];

  return defineConfig([
    includeIgnoreFile(gitignore),
    ...projectIgnores,
    js.configs.recommended,
    typescriptConfigs.recommended,
    {
      files: [getDefault(codeFilesSchema)],
      rules: baseRules,
    },
  ]);
}
