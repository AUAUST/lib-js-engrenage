import type { defineConfig } from "eslint/config";

import type { Rules } from "#tools/eslint/types/Rules";

/**
 * A config object of `defineConfig`, whose `rules` also accept the `info`
 * severity.
 */
export interface ConfigObject extends Omit<
  Exclude<Parameters<typeof defineConfig>[number], unknown[]>,
  "rules"
> {
  rules?: Rules;
}
