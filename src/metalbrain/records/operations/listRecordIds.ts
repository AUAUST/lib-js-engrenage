import { isString } from "@auaust/toolkit";

import { readRecordGroups } from "#metalbrain/records/operations/readRecordGroups";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Every entry ID the parsable group files of `kind` hold, valid or not.
 */
export async function listRecordIds(
  filesystem: Filesystem,
  kind: RecordKind,
): Promise<Set<string>> {
  const ids = new Set<string>();

  for (const group of await readRecordGroups(filesystem, kind)) {
    if (group.kind === "invalid") {
      continue;
    }

    for (const { loose } of group.entries) {
      if (isString(loose.id)) {
        ids.add(loose.id);
      }
    }
  }

  return ids;
}
