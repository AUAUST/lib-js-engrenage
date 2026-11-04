import type { ResolvableValue } from "@auaust/toolkit/value";

import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Delegate } from "#eslint/types/Delegate";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { Presets } from "#presets/types/Presets";
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
