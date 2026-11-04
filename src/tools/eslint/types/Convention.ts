import type { ResolvableValue } from "@auaust/toolkit/value";

import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Trait } from "#project/presets/types/Trait";
import type { Delegate } from "#tools/eslint/types/Delegate";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export interface Convention {
  enabled: boolean;
  traits: readonly Trait[];
  requires: PackageNames;
  files: ScopeReferences;
  ignores: ScopeReferences;
  typeAware: boolean;
  severity: "error" | "warn" | "info";
  delegates: ResolvableValue<readonly Delegate[], [ProjectConfig]>;
  rule?: ResolvableValue<RuleModule, [ProjectConfig]>;
}
