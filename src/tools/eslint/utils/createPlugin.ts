import { every } from "@auaust/primitive-kit/arrays";
import { entries, values } from "@auaust/toolkit/object";

import { createRuleName } from "#tools/eslint/utils/createRuleName";
import { resolveDelegate } from "#tools/eslint/utils/resolveDelegate";
import type { ConfigContext } from "#project/config/index";
import type { Convention } from "#tools/eslint/types/Convention";
import type { Plugin } from "#tools/eslint/types/Plugin";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function createPlugin(
  categories: Readonly<Record<string, Readonly<Record<string, Convention>>>>,
  sections: ResolvedSections,
  context: ConfigContext,
): Plugin {
  const rules: Record<string, RuleModule> = {};

  function register(name: string, rule: RuleModule) {
    if (name in rules) {
      throw new Error(`Several conventions define the rule "${name}"`);
    }

    rules[name] = rule;
  }

  for (const conventions of values(categories)) {
    for (const [name, convention] of entries(conventions)) {
      // @debt a disabled convention reading sections registers no rule, since its sections stay unresolved; a configuration naming one of its rules finds none
      if (!every(convention.sections, sections.has)) {
        continue;
      }

      for (const delegate of convention.delegates(sections, context)) {
        register(delegate.name, resolveDelegate(delegate));
      }

      if (convention.rule !== undefined) {
        register(createRuleName(name), convention.rule(sections, context));
      }
    }
  }

  return {
    rules,
  };
}
