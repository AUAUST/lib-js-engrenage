import type { Rule } from "eslint";

import type { Delegate } from "#tools/eslint/ports/Delegate";
import type { ReportDescriptor } from "#tools/eslint/types/ReportDescriptor";
import type { RuleOptions } from "#tools/eslint/types/RuleOptions";
import type { Rules } from "#tools/eslint/types/Rules";

/**
 * Creates a delegate wrapping the `upstream` rule with default `options`, named
 * by default after the upstream rule without its plugin prefix.
 *
 * @experimental
 */
export function delegateRule<Id extends keyof Rules & string>(
  upstream: Id,
  options?: RuleOptions<Id>,
  {
    name = upstream.slice(upstream.lastIndexOf("/") + 1),
    ...behavior
  }: {
    name?: string;
    ignoredMessages?: readonly string[];
    ignoreReport?(
      descriptor: ReportDescriptor,
      context: Rule.RuleContext,
    ): boolean;
    fix?(
      descriptor: ReportDescriptor,
      context: Rule.RuleContext,
    ): Rule.ReportFixer | null;
  } = {},
): Delegate {
  return {
    name,
    upstream,
    options: options ?? [],
    ...behavior,
  };
}
