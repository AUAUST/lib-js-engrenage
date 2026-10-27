import type { ResolvableValue } from "@auaust/toolkit/value";

import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Delegate } from "#eslint/types/Delegate";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export interface Convention {
  enabled: boolean;
  presets: Presets;
  requires: PackageNames;
  files: ScopeReferences;
  ignores: ScopeReferences;
  typeAware: boolean;
  severity: "error" | "warn" | "info";
  delegates: ResolvableValue<ReadonlyArray<Delegate>, [ResolvedConfig]>;
  rule?: RuleModule;
}
