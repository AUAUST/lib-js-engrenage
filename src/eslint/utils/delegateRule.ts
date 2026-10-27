import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries } from "@auaust/toolkit/object";

import { findUpstreamRule } from "#eslint/utils/findUpstreamRule";
import type { Delegate } from "#eslint/types/Delegate";
import type { RuleOptions } from "#eslint/types/RuleOptions";
import type { Rules } from "#eslint/types/Rules";

function mergeOption(defaults: unknown, override: unknown): unknown {
  if (override === undefined) {
    return defaults;
  }

  if (!isPlainObject(defaults) || !isPlainObject(override)) {
    return override;
  }

  const merged: Record<string, unknown> = {
    ...defaults,
  };

  for (const [key, value] of entries(override)) {
    merged[key] = mergeOption(defaults[key], value);
  }

  return merged;
}

export function delegateRule<Id extends keyof Rules & string>(
  upstream: Id,
  options?: RuleOptions<Id>,
  name = upstream.slice(upstream.lastIndexOf("/") + 1),
): Delegate {
  const rule = findUpstreamRule(upstream);

  const upstreamDefaults: ReadonlyArray<unknown> =
    rule.meta?.defaultOptions ?? [];

  const overrides: ReadonlyArray<unknown> = options ?? [];

  const defaultOptions = Array.from(
    {
      length: Math.max(upstreamDefaults.length, overrides.length),
    },
    (_, index) => {
      return mergeOption(upstreamDefaults[index], overrides[index]);
    },
  );

  return {
    name,
    upstream,
    rule: {
      ...rule,
      meta: {
        ...rule.meta,
        defaultOptions,
      },
    },
  };
}
