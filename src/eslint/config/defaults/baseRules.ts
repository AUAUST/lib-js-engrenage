import type { Rules } from "#eslint/types/Rules";

export const baseRules: Rules = {
  "@typescript-eslint/ban-ts-comment": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unsafe-function-type": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "no-cond-assign": "off",
  curly: ["error", "all"],
};
