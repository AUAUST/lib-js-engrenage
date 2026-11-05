import { entries, values } from "@auaust/toolkit/object";
import { value } from "@auaust/toolkit/value";

import { createRuleName } from "#tools/eslint/utils/createRuleName";
import type { Convention } from "#tools/eslint/types/Convention";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function createPlugin(
  categories: Record<string, Record<string, Convention>>,
  config: ConventionConfig,
): Plugin {
  const rules: Record<string, RuleModule> = {};

  function register(name: string, rule: RuleModule) {
    if (name in rules) {
      throw new Error(`Several conventions define the rule "${name}"`);
    }

    rules[name] = rule;
  }

  for (const conventions of values(categories)) {
    for (const [name, { delegates, rule }] of entries(conventions)) {
      for (const delegate of value(delegates, config)) {
        register(delegate.name, delegate.rule);
      }

      if (rule !== undefined) {
        register(createRuleName(name), value(rule, config));
      }
    }
  }

  return {
    rules,
  };
}
