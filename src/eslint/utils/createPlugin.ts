import { entries, values } from "@auaust/toolkit/object";
import { value } from "@auaust/toolkit/value";

import { createRuleName } from "#eslint/utils/createRuleName";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Convention } from "#eslint/types/Convention";
import type { Plugin } from "#eslint/types/Plugin";
import type { RuleModule } from "#eslint/types/RuleModule";

export function createPlugin(
  categories: Record<string, Record<string, Convention>>,
  config: ResolvedConfig,
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
        register(createRuleName(name), rule);
      }
    }
  }

  return {
    rules,
  };
}
