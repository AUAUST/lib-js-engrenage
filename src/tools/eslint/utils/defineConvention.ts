import { values } from "@auaust/toolkit/object";
import { value, type ResolvableValue } from "@auaust/toolkit/value";

import type { ConfigContext } from "#project/config/index";
import type { Trait } from "#project/presets/index";
import type { Convention } from "#tools/eslint/ports/Convention";
import type { Delegate } from "#tools/eslint/ports/Delegate";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";
import type { ConventionValues } from "#tools/eslint/types/ConventionValues";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

/**
 * @experimental
 */
export function defineConvention<
  Sections extends ConventionSections = Record<never, never>,
>({
  sections,
  delegates = [],
  rule,
  files = ["files.code"],
  ignores = [],
  typeAware = false,
  severity = "error",
  enabled = true,
  traits = [],
  requires = [],
}: {
  sections?: Sections;
  delegates?: ResolvableValue<
    readonly Delegate[],
    [ConventionValues<Sections>, ConfigContext]
  >;
  rule?: ResolvableValue<
    RuleModule,
    [ConventionValues<Sections>, ConfigContext]
  >;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  typeAware?: boolean;
  severity?: "error" | "warn" | "info";
  enabled?: boolean;
  traits?: readonly Trait[];
  requires?: PackageNames;
}): Convention {
  function resolveDelegates(
    resolved: ResolvedSections,
    context: ConfigContext,
  ): readonly Delegate[] {
    return value(delegates, resolved.pick(sections), context);
  }

  return {
    enabled,
    traits,
    requires,
    files,
    ignores,
    typeAware,
    severity,
    sections: sections === undefined ? [] : values(sections),
    delegates: resolveDelegates,
    ...(rule === undefined
      ? {}
      : {
          rule(resolved: ResolvedSections, context: ConfigContext) {
            return value(rule, resolved.pick(sections), context);
          },
        }),
  };
}
