import type { RuleModule } from "#eslint/types/RuleModule";

export interface Delegate {
  name: string;
  upstream: string;
  rule: RuleModule;
}
