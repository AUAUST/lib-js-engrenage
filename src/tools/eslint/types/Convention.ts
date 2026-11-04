import type { ResolvableValue } from "@auaust/toolkit/value";

import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Presets } from "#project/presets/types/Presets";
import type { Delegate } from "#tools/eslint/types/Delegate";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export interface Convention {
  enabled: boolean;
  presets: Presets;
  requires: PackageNames;
  files: ScopeReferences;
  ignores: ScopeReferences;
  typeAware: boolean;
  severity: "error" | "warn" | "info";
  delegates: ResolvableValue<readonly Delegate[], [ResolvedConfig]>;
  rule?: ResolvableValue<RuleModule, [ResolvedConfig]>;
}
