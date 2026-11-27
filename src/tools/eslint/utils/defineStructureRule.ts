import type { Rule } from "eslint";

import { createRuleMeta } from "#tools/eslint/utils/createRuleMeta";
import type { Entity, EntityIndex } from "#batiment/structure/index";
import type { RuleModule } from "#tools/eslint/types/RuleModule";

export function defineStructureRule({
  entities,
  description,
  messages,
  hasSuggestions,
  create,
}: {
  entities: EntityIndex;
  description: string;
  messages: Record<string, string>;
  hasSuggestions?: boolean;
  create(context: Rule.RuleContext, entity: Entity): Rule.RuleListener;
}): RuleModule {
  return {
    meta: createRuleMeta({
      description,
      messages,
      hasSuggestions,
    }),
    create(context) {
      const entity = entities.entityOf(context.filename);

      return entity === undefined ? {} : create(context, entity);
    },
  };
}
