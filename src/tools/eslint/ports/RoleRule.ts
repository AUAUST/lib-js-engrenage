import type { Rule } from "eslint";

import type { RoleRuleModule } from "#project/roles/index";
import type { Entity, EnvironmentFileNames } from "#project/structure/index";

export interface RoleRule extends RoleRuleModule {
  readonly tool: "eslint";
  readonly rule: {
    readonly meta?: Rule.RuleMetaData;
    create(
      context: Rule.RuleContext,
      entity: Entity,
      files: EnvironmentFileNames,
    ): Rule.RuleListener;
  };
}
