import { defineRestriction } from "#eslint/conventions/defineRestriction";
import type { Presets } from "#config/types/Presets";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReference } from "#eslint/types/ScopeReference";
import type { PackageNames } from "#types/PackageNames";

export function defineReplacement({
  selector,
  target,
  replacement,
  files,
  ignores,
  enabled,
  presets,
  requires,
}: {
  selector: string;
  target: string;
  replacement: string;
  files?: ReadonlyArray<ScopeReference>;
  ignores?: ReadonlyArray<ScopeReference>;
  enabled?: boolean;
  presets?: Presets;
  requires?: PackageNames;
}): Convention {
  return defineRestriction({
    selector,
    message: `Use ${replacement} instead of ${target}.`,
    files,
    ignores,
    enabled,
    presets,
    requires,
  });
}
