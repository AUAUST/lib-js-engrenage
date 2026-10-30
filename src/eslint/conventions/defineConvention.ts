import type { ResolvableValue } from "@auaust/toolkit/value";

import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Convention } from "#eslint/types/Convention";
import type { Delegate } from "#eslint/types/Delegate";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export function defineConvention({
  delegates = [],
  rule,
  files = ["files.code"],
  ignores = [],
  typeAware = false,
  severity = "error",
  enabled = true,
  presets = [],
  requires = [],
}: {
  delegates?: ResolvableValue<readonly Delegate[], [ResolvedConfig]>;
  rule?: RuleModule;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  typeAware?: boolean;
  severity?: "error" | "warn" | "info";
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
    severity,
    delegates,
    ...(rule === undefined ? {} : { rule }),
  };
}
