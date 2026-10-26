import { entries, values } from "@auaust/toolkit/object";

import { createRuleName } from "#eslint/utils/createRuleName";
import type { Convention } from "#eslint/types/Convention";
import type { Plugin } from "#eslint/types/Plugin";
import type { RuleModule } from "#eslint/types/RuleModule";

export function createPlugin(
  categories: Record<string, Record<string, Convention>>,
): Plugin {
  const rules: Record<string, RuleModule> = {};

  for (const conventions of values(categories)) {
    for (const [name, { rule }] of entries(conventions)) {
      if (rule === undefined) {
        continue;
      }

      const ruleName = createRuleName(name);

      if (ruleName in rules) {
        throw new Error(`Several conventions define the rule "${ruleName}"`);
      }

      rules[ruleName] = rule;
    }
  }

  return {
    rules,
  };
}
