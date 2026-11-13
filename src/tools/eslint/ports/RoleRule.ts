import type { Rule } from "eslint";

import type { RoleRuleModule } from "#project/roles/index";
import type { Entity, EnvironmentFileNames } from "#project/structure/index";

export interface RoleRule extends RoleRuleModule {
  /**
   * Marks the module as an ESLint rule; modules for other tools are skipped.
   */
  readonly tool: "eslint";
  /**
   * Rule run as an error on the files of each role carrying it; `create` also
   * receives the linted file's entity and its environment's index and entry file
   * names, and is skipped for files outside the structure.
   */
  readonly rule: {
    readonly meta?: Rule.RuleMetaData;
    create(
      context: Rule.RuleContext,
      entity: Entity,
      files: EnvironmentFileNames,
    ): Rule.RuleListener;
  };
}
