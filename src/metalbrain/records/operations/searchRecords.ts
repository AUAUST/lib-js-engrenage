import { isArray, isString } from "@auaust/toolkit";

import { listRecords } from "#metalbrain/records/operations/listRecords";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

function listTexts(value: unknown): unknown[] {
  return isArray(value) ? value : [value];
}

/**
 * The entries of `kind`, as `listRecords` lists them, holding `keyword` in any
 * field, its ID included, ignoring case.
 */
export async function searchRecords(
  filesystem: Filesystem,
  kind: RecordKind,
  keyword: string,
) {
  const needle = keyword.toLowerCase();

  const entries = await listRecords(filesystem, kind);

  return entries.filter(({ entry }) => {
    return Object.values(entry)
      .flatMap(listTexts)
      .some((text) => {
        return isString(text) && text.toLowerCase().includes(needle);
      });
  });
}
