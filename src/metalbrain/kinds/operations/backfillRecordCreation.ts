import { isMap } from "yaml";

import { recordKinds } from "#metalbrain/kinds/constants";
import {
  formatRecordDocument,
  formatRecordTime,
  isLegacyRecordId,
  readRecordDocument,
  readRecordGroups,
  readRenamedRecordIds,
  sortRecordEntryNode,
} from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";

function readFormerDay(former: string): Date {
  const year = Number(former.slice(0, 2));
  const month = Number(former.slice(2, 4));
  const day = Number(former.slice(4, 6));

  return new Date(Date.UTC(2000 + year, month - 1, day));
}

/**
 * Gives each entry of every record kind lacking `created` the day its
 * `YYMMDD-xxxx` ID names, or else its former one read from `.ai/renamed-ids.yml`,
 * at midnight UTC, or the current time for an entry holding neither.
 *
 * @returns The number of entries given a `created`.
 * @throws {Error} When the mapping or a group file is unparsable.
 */
export async function backfillRecordCreation(
  filesystem: Filesystem,
): Promise<number> {
  const formerIds = new Map<string, string>();

  for (const [former, ids] of await readRenamedRecordIds(filesystem)) {
    for (const id of ids) {
      formerIds.set(id, former);
    }
  }

  const now = formatRecordTime(new Date());

  let filled = 0;

  for (const kind of recordKinds) {
    for (const group of await readRecordGroups(filesystem, kind)) {
      if (group.kind === "invalid") {
        continue;
      }

      const record = await readRecordDocument(filesystem, kind, group.name);

      let changed = false;

      for (const node of record.entries.items) {
        if (!isMap(node) || node.has("created")) {
          continue;
        }

        const id = String(node.get("id"));

        const former = isLegacyRecordId(id) ? id : formerIds.get(id);

        node.set(
          "created",
          former === undefined ? now : formatRecordTime(readFormerDay(former)),
        );

        sortRecordEntryNode(kind, node);

        changed = true;

        filled += 1;
      }

      if (changed) {
        await filesystem.write(
          record.file,
          formatRecordDocument(record.document),
        );
      }
    }
  }

  return filled;
}
