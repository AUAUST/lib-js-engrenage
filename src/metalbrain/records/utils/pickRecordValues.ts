import { isArray, isString } from "@auaust/toolkit";

import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * The values `options` gives for the fields of `kind`, each a text or a list of
 * texts, other keys and values of other forms left out.
 */
export function pickRecordValues(
  kind: RecordKind,
  options: Readonly<Record<string, unknown>>,
): Record<string, string | readonly string[]> {
  return Object.fromEntries(
    Object.keys(kind.fields).flatMap((key) => {
      const value = options[key];

      return isString(value) || (isArray(value) && value.every(isString))
        ? [[key, value]]
        : [];
    }),
  );
}
