import type { Rule } from "eslint";

export function createRuleMeta({
  description,
  messages,
  hasSuggestions = false,
}: {
  description: string;
  messages: Record<string, string>;
  hasSuggestions?: boolean | undefined;
}): Rule.RuleMetaData {
  return {
    type: "problem",
    docs: { description },
    messages,
    hasSuggestions,
    schema: [],
  };
}
