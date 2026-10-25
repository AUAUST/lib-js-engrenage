import { baseRules } from "#config/eslint/baseRules";
import { typescriptFiles } from "#config/eslint/typescriptFiles";
import type { Config } from "#eslint/types/Config";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import { resolvePath } from "#utils/resolvePath";
import js from "@eslint/js";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

export function createBaseRules({
  root,
  ignores = [],
}: {
  root: Directory | URL;
  ignores?: Glob[];
}): Config[] {
  const gitignore = resolvePath(root, ".gitignore");

  const projectIgnores = ignores.length > 0 ? [globalIgnores(ignores)] : [];

  return defineConfig([
    includeIgnoreFile(gitignore),
    ...projectIgnores,
    js.configs.recommended,
    typescriptConfigs.recommended,
    {
      files: [typescriptFiles],
      rules: baseRules,
    },
  ]);
}
