import type { ResolvableValue } from "@auaust/toolkit/value";

import type { Presets } from "#config/types/Presets";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { RuleModule } from "#eslint/types/RuleModule";
import type { Rules } from "#eslint/types/Rules";
import type { ScopeReference } from "#eslint/types/ScopeReference";
import type { PackageNames } from "#types/PackageNames";

export interface Convention {
  enabled: boolean;
  presets: Presets;
  requires: PackageNames;
  files: ReadonlyArray<ScopeReference>;
  ignores: ReadonlyArray<ScopeReference>;
  typeAware: boolean;
  rules: ResolvableValue<Rules, [ResolvedConfig]>;
  rule?: RuleModule;
}
