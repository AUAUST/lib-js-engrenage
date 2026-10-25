import type { Convention } from "#eslint/types/Convention";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { Rules } from "#eslint/types/Rules";
import type { ScopeReference } from "#eslint/types/ScopeReference";

export function defineConvention({
  rules = {},
  rule,
  files = ["files.code"],
  ignores = [],
  typeAware = false,
  enabled = true,
}: {
  rules?: Rules;
  rule?: RuleModule;
  files?: ScopeReference[];
  ignores?: ScopeReference[];
  typeAware?: boolean;
  enabled?: boolean;
}): Convention {
  return {
    enabled,
    scope: {
      files,
      ignores,
    },
    typeAware,
    rules,
    rule,
  };
}
