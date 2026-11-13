import { isArray } from "@auaust/toolkit/isArray";
import { isBoolean } from "@auaust/toolkit/isBoolean";
import { isNumber } from "@auaust/toolkit/isNumber";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries } from "@auaust/toolkit/object";

import { listDefaults } from "#foundation/options/utils/listDefaults";
import type { Default } from "#foundation/options/ports/Default";

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

  if (isBoolean(value) || isNumber(value)) {
    return String(value);
  }

  return `\`${String(value)}\``;
}

export function describeDefault(fallback: Default<unknown, never>): string {
  return "explain" in fallback
    ? fallback.explain
    : describeValue(fallback.value);
}
