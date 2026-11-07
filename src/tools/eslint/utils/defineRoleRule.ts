import type { Rule } from "eslint";

import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import type { RoleRuleModule } from "#project/roles/index";
import type { Entity, EnvironmentFileNames } from "#project/structure/index";

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
}): RoleRuleModule {
  return {
    meta: createRuleMeta({ description, messages }),
    create,
  };
}
