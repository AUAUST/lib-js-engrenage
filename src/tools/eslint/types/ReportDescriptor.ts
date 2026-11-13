import type { Rule } from "eslint";

/**
 * The descriptor a rule passes to `context.report`.
 */
export type ReportDescriptor = Parameters<Rule.RuleContext["report"]>[0];
