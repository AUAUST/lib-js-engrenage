import type { Rule } from "eslint";

export function createRuleMeta({
  description,
  messages,
}: {
  description: string;
  messages: Record<string, string>;
}): Rule.RuleMetaData {
  return {
    type: "problem",
    docs: { description },
    messages,
    schema: [],
  };
}
