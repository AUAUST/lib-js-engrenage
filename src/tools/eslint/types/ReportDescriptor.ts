import type { Rule } from "eslint";

export type ReportDescriptor = Parameters<Rule.RuleContext["report"]>[0];
