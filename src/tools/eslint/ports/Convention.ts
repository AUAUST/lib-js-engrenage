import type { ConfigContext, ConfigKey } from "#project/config/index";
import type { Trait } from "#project/presets/index";
import type { Delegate } from "#tools/eslint/ports/Delegate";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";
import type { RuleModule } from "#tools/eslint/types/RuleModule";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

export interface Convention {
  /**
   * Whether the convention applies when the project's options leave it unset,
   * provided `traits` and `requires` allow it.
   */
  enabled: boolean;
  /**
   * Traits enabling the convention by default when any of them is active; empty
   * means no trait is needed.
   */
  traits: readonly Trait[];
  /**
   * Packages that must all be dependencies of the project for the convention to
   * apply by default.
   */
  requires: PackageNames;
  /**
   * Scopes of the files the convention lints.
   */
  files: ScopeReferences;
  /**
   * Scopes of the files excluded from `files`.
   */
  ignores: ScopeReferences;
  /**
   * Whether the convention needs type information: it gets type-aware parser
   * options, and is skipped when the `typeAware` option is off.
   */
  typeAware: boolean;
  /**
   * Severity of the convention's rule and of each delegate rule.
   */
  severity: "error" | "warn" | "info";
  /**
   * Config sections resolved before `delegates` and `rule` are called, and passed
   * to them.
   */
  sections: readonly ConfigKey[];
  /**
   * Upstream rules the convention wraps: each one is turned off and replaced by
   * its delegate, reported at the convention's severity.
   */
  delegates(
    sections: ResolvedSections,
    context: ConfigContext,
  ): readonly Delegate[];
  /**
   * The convention's own rule, registered as
   * `auaust/<kebab-case convention name>`.
   */
  rule?(sections: ResolvedSections, context: ConfigContext): RuleModule;
}
