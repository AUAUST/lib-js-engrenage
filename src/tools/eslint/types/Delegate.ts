import type { RuleModule } from "#tools/eslint/types/RuleModule";

export interface Delegate {
  name: string;
  upstream: string;
  rule: RuleModule;
}
