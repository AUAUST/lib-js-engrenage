import type { ResolvableValue } from "@auaust/toolkit/value";

import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Presets } from "#project/presets/types/Presets";
import type { Convention } from "#tools/eslint/types/Convention";
import type { Delegate } from "#tools/eslint/types/Delegate";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
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
  delegates?: ResolvableValue<readonly Delegate[], [ProjectConfig]>;
  rule?: ResolvableValue<RuleModule, [ProjectConfig]>;
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
