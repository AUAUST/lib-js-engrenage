import type { Rule } from "eslint";

import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import type { Entity } from "#project/structure/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function defineStructureRule({
  config,
  description,
  messages,
  create,
}: {
  config: ConventionConfig;
  description: string;
  messages: Record<string, string>;
  create(context: Rule.RuleContext, entity: Entity): Rule.RuleListener;
}): RuleModule {
  return {
    meta: createRuleMeta({ description, messages }),
    create(context) {
      const entity = config.entities.entityOf(context.filename);

      return entity === undefined ? {} : create(context, entity);
    },
  };
}
