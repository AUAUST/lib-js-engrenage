import type { Linter } from "eslint";

/**
 * A rule entry, which also accepts the `info` severity: reported as a warning
 * and listed as an info rule.
 */
export type Rule<Options extends unknown[] = unknown[]> =
  | Linter.RuleEntry<Options>
  | "info"
  | ["info", ...Partial<Options>];
