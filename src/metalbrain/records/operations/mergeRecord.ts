import { isString } from "@auaust/toolkit";

import { findRecord } from "#metalbrain/records/operations/findRecord";
import { removeRecordEntry } from "#metalbrain/records/operations/removeRecordEntry";
import { writeRecordDocument } from "#metalbrain/records/operations/writeRecordDocument";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import { appendRecordTaps } from "#metalbrain/records/utils/appendRecordTaps";
import { checkTapNote } from "#metalbrain/records/utils/checkTapNote";
import { formatRecordTime } from "#metalbrain/records/utils/formatRecordTime";
import { listRecordTaps } from "#metalbrain/records/utils/listRecordTaps";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages the removal of the `kind` entry `removed` and a tap at the current
 * time on the entry `kept`, which keeps its `created` and receives the removed
 * entry's taps; the tap's note is `note`, otherwise the removed entry's `title`
 * field on one line. Then regenerates the kind's index.
 *
 * @returns Both entries' current IDs.
 * @throws {Error} When the kind takes no taps, `note` is not one line within
 * `noteCap` words, `findRecord` finds either entry not, both name one entry, or
 * the kept entry's group would break the kind's schema, staging nothing.
 */
export async function mergeRecord(
  filesystem: Filesystem,
  kind: RecordKind,
  { removed, kept }: { removed: string; kept: string },
  {
    note,
    noteCap,
    wordCap,
  }: { note: string | undefined; noteCap: number; wordCap: number },
): Promise<{ removed: string; kept: string }> {
  if (kind.taps !== true) {
    throw new Error(`The ${kind.name} records take no taps, so none merge`);
  }

  if (note !== undefined) {
    checkTapNote(note, noteCap);
  }

  const source = await findRecord(filesystem, kind, removed);

  const target = await findRecord(filesystem, kind, kept);

  if (source.id === target.id) {
    throw new Error(
      `The ${kind.name} entry ${source.id} cannot merge into itself`,
    );
  }

  const title = kind.title === undefined ? undefined : source.entry[kind.title];

  const tapNote = (
    note ??
    (isString(title) ? title.replaceAll(/\s+/gu, " ").trim() : undefined)
  );

  const carried = listRecordTaps(source, source.id);

  await removeRecordEntry(filesystem, source);

  const current = await findRecord(filesystem, kind, target.id);

  appendRecordTaps(current, [
    ...carried.map((tap) => {
      return { ...tap, id: current.id };
    }),
    {
      id: current.id,
      at: formatRecordTime(new Date()),
      ...(tapNote !== undefined && tapNote !== "" && { note: tapNote }),
    },
  ]);

  await writeRecordDocument(filesystem, kind, current, {
    id: current.id,
    wordCap,
  });

  await writeRecordIndex(filesystem, kind);

  return { removed: source.id, kept: current.id };
}
