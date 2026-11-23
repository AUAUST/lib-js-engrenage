import type { Rule } from "eslint";

import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import type { Entity, EnvironmentFileNames } from "#batiment/structure/index";
import type { RoleRule } from "#tools/eslint/ports/RoleRule";

/**
 * Creates a role rule, with `description` and `messages` as its metadata.
 */
export function defineRoleRule({
  description,
  messages,
  create,
}: {
  description: string;
  messages: Record<string, string>;
  create(
    context: Rule.RuleContext,
    entity: Entity,
    files: EnvironmentFileNames,
  ): Rule.RuleListener;
}): RoleRule {
  return {
    rule: {
      meta: createRuleMeta({ description, messages }),
      create,
    },
  };
}
