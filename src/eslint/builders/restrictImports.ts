import type { ImportPattern } from "#eslint/types/ImportPattern";
import type { Rules } from "#eslint/types/Rules";

export function restrictImports(...patterns: ImportPattern[]): Rules {
  return {
    "no-restricted-imports": [
      "error",
      {
        patterns,
      },
    ],
  };
}
