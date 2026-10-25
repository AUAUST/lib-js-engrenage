import { testDirectoriesSchema } from "#config/config/schemas/testDirectoriesSchema";
import { promiseRules } from "#eslint/config/defaults/promiseRules";
import type { Config } from "#eslint/types/Config";
import { filesIn } from "#eslint/utils/filesIn";
import type { Directory } from "#types/Directory";
import { resolvePath } from "#utils/resolvePath";
import { map } from "@auaust/primitive-kit/arrays";
import { defineConfig } from "eslint/config";
import { getDefault } from "valibot";

export function createPromiseRules({
  root,
  sourceDirectories,
  testDirectories = getDefault(testDirectoriesSchema),
}: {
  root: Directory | URL;
  sourceDirectories: Directory[];
  testDirectories?: readonly Directory[];
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
