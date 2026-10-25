import { defineConvention } from "#eslint/conventions/defineConvention";

export default defineConvention({
  rules: {
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
});
