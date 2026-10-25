import type { RuleModule } from "#eslint/types/RuleModule";
import type { Rules } from "#eslint/types/Rules";
import type { Scope } from "#eslint/types/Scope";

export interface Convention {
  enabled: boolean;
  scope: Scope;
  typeAware: boolean;
  rules: Rules;
  rule?: RuleModule;
}
