import type { ResolvableValue } from "@auaust/toolkit/value";

import type { Trait } from "#project/presets/index";
import type { ConventionConfig } from "#tools/eslint/types/ConventionConfig";
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
  delegates: ResolvableValue<readonly Delegate[], [ConventionConfig]>;
  rule?: ResolvableValue<RuleModule, [ConventionConfig]>;
}
