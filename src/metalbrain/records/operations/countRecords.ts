import { isString } from "@auaust/toolkit";

import { recurringEntryCount } from "#metalbrain/records/constants";
import { listRecords } from "#metalbrain/records/operations/listRecords";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * The entries of `kind` counted by the value of its `groupBy` field, ignoring case
 * and surrounding spaces, most entries first: each value as its first entry spells
 * it, and whether it is recurring, held by `recurringEntryCount` entries or more.
 */
export async function countRecords(
  filesystem: Filesystem,
  kind: RecordKind & { readonly groupBy: string },
): Promise<{ value: string; count: number; recurring: boolean }[]> {
  const counts = new Map<string, { value: string; count: number }>();

  for (const { entry } of await listRecords(filesystem, kind)) {
    const value = entry[kind.groupBy];

    if (!isString(value)) {
      continue;
    }

    const key = value.trim().toLowerCase();

    const counted = counts.get(key) ?? { value: value.trim(), count: 0 };

    counted.count += 1;

    counts.set(key, counted);
  }

  return [...counts.values()]
    .toSorted((first, second) => second.count - first.count)
    .map(({ value, count }) => {
      return {
        value,
        count,
        recurring: count >= recurringEntryCount,
      };
    });
}
