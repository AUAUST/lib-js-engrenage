import type { Rules } from "#eslint/types/Rules";
import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";

export function restrictSyntax(...restrictions: SyntaxRestriction[]): Rules {
  return {
    "no-restricted-syntax": ["error", ...restrictions],
  };
}
