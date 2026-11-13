import type { Rule } from "eslint";

import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";

export interface Delegate {
  name: string;
  upstream: string;
  options: readonly unknown[];
  ignoredMessages?: readonly string[];
  ignoreReport?(
    descriptor: ReportDescriptor,
    context: Rule.RuleContext,
  ): boolean;
  fix?(
    descriptor: ReportDescriptor,
    context: Rule.RuleContext,
  ): Rule.ReportFixer | null;
}
