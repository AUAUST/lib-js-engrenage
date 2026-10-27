import type { ResolvableValue } from "@auaust/toolkit/value";

import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Convention } from "#eslint/types/Convention";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { Rules } from "#eslint/types/Rules";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export function defineConvention({
  rules = {},
  rule,
  files = ["code"],
  ignores = [],
  typeAware = false,
  enabled = true,
  presets = [],
  requires = [],
}: {
  rules?: ResolvableValue<Rules, [ResolvedConfig]>;
  rule?: RuleModule;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  typeAware?: boolean;
  enabled?: boolean;
  presets?: Presets;
  requires?: PackageNames;
}): Convention {
  return {
    enabled,
    presets,
    requires,
    files,
    ignores,
    typeAware,
    rules,
    rule,
  };
}
