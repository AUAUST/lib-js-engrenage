import { defineRestriction } from "#tools/eslint/utils/defineRestriction";
import type { Trait } from "#project/presets/index";
import type { Convention } from "#tools/eslint/ports/Convention";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

/**
 * Creates a convention reporting every node `selector` matches, with a message
 * asking to use `replacement` instead of `target`.
 *
 * @experimental
 */
export function defineReplacement({
  target,
  replacement,
  ...forward
}: {
  selector: string;
  target: string;
  replacement: string;
  files?: ScopeReferences;
  ignores?: ScopeReferences;
  enabled?: boolean;
  traits?: readonly Trait[];
  requires?: PackageNames;
}): Convention {
  return defineRestriction({
    ...forward,
    message: `Use ${replacement} instead of ${target}.`,
  });
}
