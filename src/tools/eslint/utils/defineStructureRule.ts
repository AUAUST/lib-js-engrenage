import type { Rule } from "eslint";

import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import type { Entity, EntityIndex } from "#project/structure/index";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function defineStructureRule({
  entities,
  description,
  messages,
  create,
}: {
  entities: EntityIndex;
  description: string;
  messages: Record<string, string>;
  create(context: Rule.RuleContext, entity: Entity): Rule.RuleListener;
}): RuleModule {
  return {
    meta: createRuleMeta({ description, messages }),
    create(context) {
      const entity = entities.entityOf(context.filename);

      return entity === undefined ? {} : create(context, entity);
    },
  };
}
