import type { Rules } from "#eslint/types/Rules";

export const stylisticRules: Rules = {
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
};
