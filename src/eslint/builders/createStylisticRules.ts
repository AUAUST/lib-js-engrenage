import { typescriptFiles } from "#eslint/presets/typescriptFiles";
import type { Config } from "#eslint/types/Config";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

export function createStylisticRules(): Config[] {
  return defineConfig([
    {
      files: [typescriptFiles],
      plugins: {
        "@stylistic": stylistic,
      },
      rules: {
        "@stylistic/object-curly-newline": [
          "error",
          {
            ObjectExpression: {
              minProperties: 1,
            },
            ObjectPattern: {
              consistent: true,
            },
            ImportDeclaration: {
              consistent: true,
            },
            ExportDeclaration: {
              consistent: true,
            },
            TSTypeLiteral: {
              consistent: true,
            },
            TSInterfaceBody: {
              consistent: true,
            },
          },
        ],
        "@stylistic/padding-line-between-statements": [
          "error",
          {
            blankLine: "always",
            prev: "import",
            next: "*",
          },
          {
            blankLine: "any",
            prev: "import",
            next: "import",
          },
          {
            blankLine: "always",
            prev: "*",
            next: "return",
          },
          {
            blankLine: "always",
            prev: ["multiline-const", "multiline-let"],
            next: "*",
          },
          {
            blankLine: "always",
            prev: "*",
            next: ["multiline-const", "multiline-let"],
          },
        ],
      },
    },
  ]);
}
