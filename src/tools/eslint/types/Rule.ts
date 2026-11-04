import type { Linter } from "eslint";

export type Rule<Options extends unknown[] = unknown[]> =
  Linter.RuleEntry<Options> | "info" | ["info", ...Partial<Options>];
