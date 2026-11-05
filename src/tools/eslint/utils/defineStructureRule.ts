import type { Rule } from "eslint";

import { locateInStructure } from "#tools/eslint/utils/locateInStructure";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { StructureLocation } from "#tools/eslint/types/StructureLocation";

export function defineStructureRule({
  config,
  description,
  messages,
  create,
}: {
  config: ConventionConfig;
  description: string;
  messages: Record<string, string>;
  create(
    context: Rule.RuleContext,
    location: StructureLocation,
  ): Rule.RuleListener;
}): RuleModule {
  return {
    meta: {
      type: "problem",
      docs: { description },
      messages,
      schema: [],
    },
    create(context) {
      const location = config.roles.enabled
        ? locateInStructure(config, context.filename)
        : undefined;

      return location === undefined ? {} : create(context, location);
    },
  };
}
