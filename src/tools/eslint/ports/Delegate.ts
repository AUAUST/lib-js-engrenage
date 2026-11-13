import type { Rule } from "eslint";

import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";

export interface Delegate {
  /**
   * Name of the wrapping rule, registered as `auaust/<name>`.
   */
  name: string;
  /**
   * Id of the wrapped upstream rule, turned off wherever the delegate applies.
   */
  upstream: string;
  /**
   * Default options of the wrapped rule, deeply merged over the upstream rule's
   * own defaults position by position.
   */
  options: readonly unknown[];
  /**
   * Message ids of the upstream rule whose reports are dropped; an id the upstream
   * rule does not declare throws.
   */
  ignoredMessages?: readonly string[];
  /**
   * Drops the reports for which it returns `true`.
   */
  ignoreReport?(
    descriptor: ReportDescriptor,
    context: Rule.RuleContext,
  ): boolean;
  /**
   * Replaces the fix of every kept report, `null` removing it, and marks the
   * rule fixable.
   */
  fix?(
    descriptor: ReportDescriptor,
    context: Rule.RuleContext,
  ): Rule.ReportFixer | null;
}
