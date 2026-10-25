import type { Rules } from "#eslint/types/Rules";

export const importRules: Rules = {
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      fixStyle: "inline-type-imports",
    },
  ],
  "@typescript-eslint/no-import-type-side-effects": "error",
  "import-x/no-duplicates": [
    "error",
    {
      "prefer-inline": true,
    },
  ],
  "import-x/no-default-export": "error",
  "import-x/no-unresolved": "off",
};
