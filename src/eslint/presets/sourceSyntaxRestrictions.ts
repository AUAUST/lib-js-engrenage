import { syntaxRestrictions } from "#eslint/presets/syntaxRestrictions";
import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";

export const sourceSyntaxRestrictions: SyntaxRestriction[] = [
  ...syntaxRestrictions,
  {
    selector: "ImportExpression",
    message:
      "Use static imports; dynamic import() is reserved for tests and framework discovery.",
  },
];
