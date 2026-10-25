import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";

export const misplacedTestRestriction: SyntaxRestriction = {
  selector: "Program",
  message: "Test files belong under the test directories.",
};
