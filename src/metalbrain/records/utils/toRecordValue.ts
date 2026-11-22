import { isString } from "@auaust/toolkit";

import type { RecordFieldType } from "#metalbrain/records/types/RecordFieldType";

/**
 * The value an entry stores for a field of `type` given `value`: a text as is,
 * no value for a missing or empty list, a detail of one item as text.
 */
export function toRecordValue(
  type: RecordFieldType,
  value: string | readonly string[] | undefined,
): string | readonly string[] | undefined {
  if (isString(value)) {
    return value;
  }

  if (value === undefined || value.length === 0) {
    return;
  }

  return type === "detail" && value.length === 1 ? value[0] : value;
}
