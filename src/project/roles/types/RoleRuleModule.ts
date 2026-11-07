// @debt the tool-agnostic roles domain describes ESLint rule modules and imports ESLint types; a role could carry tool rules through a contract the ESLint domain implements
import type { Rule } from "eslint";

export interface RoleRuleModule {
  readonly meta?: Rule.RuleMetaData;
  create(
    context: Rule.RuleContext,
    entity?: unknown,
    files?: unknown,
  ): Rule.RuleListener;
}
