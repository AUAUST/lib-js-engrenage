import { isBoolean } from "@auaust/toolkit/isBoolean";

import type { Convention } from "#eslint/types/Convention";

export function isConventionEnabled(
  name: string,
  convention: Convention,
  setting: boolean | Partial<Record<string, boolean>>,
): boolean {
  if (setting === false) {
    return false;
  }

  if (isBoolean(setting)) {
    return convention.enabled;
  }

  return setting[name] ?? convention.enabled;
}
