import js from "@eslint/js";
import { typescriptFiles } from "#eslint/presets/typescriptFiles";
import type { EslintConventions } from "#eslint/types/EslintConventions";
import { resolveFromRoot } from "#eslint/utils/resolveFromRoot";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import { configs as typescriptConfigs } from "typescript-eslint";

export function createBaseRules({
  root,
  ignores = [],
}: Pick<EslintConventions, "root" | "ignores">) {
  const gitignore = resolveFromRoot(root, ".gitignore");

  const projectIgnores = ignores.length > 0 ? [globalIgnores(ignores)] : [];

  return defineConfig([
    includeIgnoreFile(gitignore),
    ...projectIgnores,
    js.configs.recommended,
    typescriptConfigs.recommended,
    {
      files: [typescriptFiles],
      rules: {
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-function-type": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-cond-assign": "off",
        curly: ["error", "all"],
      },
    },
  ]);
}
