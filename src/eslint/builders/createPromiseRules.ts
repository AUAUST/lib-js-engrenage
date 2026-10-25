import { promiseRules } from "#config/eslint/promiseRules";
import { testDirectories as defaultTestDirectories } from "#config/eslint/testDirectories";
import type { Config } from "#eslint/types/Config";
import { filesIn } from "#eslint/utils/filesIn";
import type { Directory } from "#types/Directory";
import { resolvePath } from "#utils/resolvePath";
import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig } from "eslint/config";

export function createPromiseRules({
  root,
  sourceDirectories,
  testDirectories = defaultTestDirectories,
}: {
  root: Directory | URL;
  sourceDirectories: Directory[];
  testDirectories?: Directory[];
}): Config[] {
  return defineConfig([
    {
      files: map([...sourceDirectories, ...testDirectories], filesIn),
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: resolvePath(root),
        },
      },
      rules: promiseRules,
    },
  ]);
}
