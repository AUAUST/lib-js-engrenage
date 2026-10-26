import type { Presets } from "#config/types/Presets";
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
  presets = [],
}: {
  rules?: Rules;
  rule?: RuleModule;
  files?: readonly ScopeReference[];
  ignores?: readonly ScopeReference[];
  typeAware?: boolean;
  enabled?: boolean;
  presets?: Presets;
}): Convention {
  return {
    enabled,
    presets,
    files,
    ignores,
    typeAware,
    rules,
    rule,
  };
}
