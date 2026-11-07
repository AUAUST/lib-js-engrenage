import type { Section } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/index";
import type { Trait } from "#project/presets/index";
import type { Delegate } from "#tools/eslint/types/Delegate";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";
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
  sections: readonly Section[];
  delegates(
    sections: ResolvedSections,
    context: ConfigContext,
  ): readonly Delegate[];
  rule?(sections: ResolvedSections, context: ConfigContext): RuleModule;
}
