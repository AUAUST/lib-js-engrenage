import { isArray } from "@auaust/toolkit/isArray";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries } from "@auaust/toolkit/object";

import { listDefaults } from "#options/utils/listDefaults";
import type { Default } from "#options/types/Default";

function describeValue(value: unknown): string {
  if (value == null) {
    return "none";
  }

  if (isArray(value)) {
    return value.length === 0 ? "none" : listDefaults(value.map(String));
  }

  if (isPlainObject(value)) {
    return entries(value).length === 0
      ? "none"
      : `\`${JSON.stringify(value)}\``;
  }

  return `\`${String(value)}\``;
}

export function describeDefault(fallback: Default<unknown, never>): string {
  return "explain" in fallback
    ? fallback.explain
    : describeValue(fallback.value);
}
