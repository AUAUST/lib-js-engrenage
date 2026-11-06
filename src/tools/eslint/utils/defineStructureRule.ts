import type { Rule } from "eslint";

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
    meta: {
      type: "problem",
      docs: { description },
      messages,
      schema: [],
    },
    create(context) {
      const entity = config.entities.entityOf(context.filename);

      return entity === undefined ? {} : create(context, entity);
    },
  };
}
