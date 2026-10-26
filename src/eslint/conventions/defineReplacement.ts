import { defineRestriction } from "#eslint/conventions/defineRestriction";
import type { Convention } from "#eslint/types/Convention";
import type { ScopeReference } from "#eslint/types/ScopeReference";

export function defineReplacement({
  selector,
  target,
  replacement,
  files,
  ignores,
  enabled,
}: {
  selector: string;
  target: string;
  replacement: string;
  files?: readonly ScopeReference[];
  ignores?: readonly ScopeReference[];
  enabled?: boolean;
}): Convention {
  return defineRestriction({
    selector,
    message: `Use ${replacement} instead of ${target}.`,
    files,
    ignores,
    enabled,
  });
}
