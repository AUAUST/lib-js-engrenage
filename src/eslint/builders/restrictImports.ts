import type { ImportPattern } from "#eslint/types/ImportPattern";
import type { Linter } from "eslint";

export function restrictImports(
  ...patterns: ImportPattern[]
): Linter.RulesRecord {
  return {
    "no-restricted-imports": [
      "error",
      {
        patterns,
      },
    ],
  };
}
