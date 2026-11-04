import type { defineConfig } from "eslint/config";

import type { Rules } from "#eslint/types/Rules";

export interface ConfigObject extends Omit<
  Exclude<Parameters<typeof defineConfig>[number], unknown[]>,
  "rules"
> {
  rules?: Rules;
}
