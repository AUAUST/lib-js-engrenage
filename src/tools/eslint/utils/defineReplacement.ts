import { defineRestriction } from "#tools/eslint/utils/defineRestriction";
import type { Trait } from "#project/presets/types/Trait";
import type { Convention } from "#tools/eslint/types/Convention";
import type { ScopeReferences } from "#tools/eslint/types/ScopeReferences";
import type { PackageNames } from "#types/PackageNames";

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
