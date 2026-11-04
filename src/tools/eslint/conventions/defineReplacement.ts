import { defineRestriction } from "#eslint/conventions/defineRestriction";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReferences } from "#eslint/types/ScopeReferences";
import type { Presets } from "#presets/types/Presets";
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
  presets?: Presets;
  requires?: PackageNames;
}): Convention {
  return defineRestriction({
    ...forward,
    message: `Use ${replacement} instead of ${target}.`,
  });
}
