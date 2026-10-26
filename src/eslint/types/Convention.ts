import type { Presets } from "#config/types/Presets";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { Rules } from "#eslint/types/Rules";
import type { ScopeReference } from "#eslint/types/ScopeReference";

export interface Convention {
  enabled: boolean;
  presets: Presets;
  files: ReadonlyArray<ScopeReference>;
  ignores: ReadonlyArray<ScopeReference>;
  typeAware: boolean;
  rules: Rules;
  rule?: RuleModule;
}
