import { map } from "@auaust/primitive-kit/arrays";
import type { EslintConventions } from "#eslint/types/EslintConventions";
import { filesIn } from "#eslint/utils/filesIn";
import { resolveFromRoot } from "#eslint/utils/resolveFromRoot";
import { defineConfig } from "eslint/config";

export function createPromiseRules({
  root,
  sourceDirectories,
  testDirectories = ["tests"],
}: Pick<EslintConventions, "root" | "sourceDirectories" | "testDirectories">) {
  return defineConfig([
    {
      files: map([...sourceDirectories, ...testDirectories], filesIn),
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: resolveFromRoot(root, "."),
        },
      },
      rules: {
        "@typescript-eslint/no-misused-promises": [
          "error",
          {
            checksVoidReturn: {
              attributes: false,
            },
          },
        ],
      },
    },
  ]);
}
