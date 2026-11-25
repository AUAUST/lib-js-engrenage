import { findRecord } from "#metalbrain/records/operations/findRecord";
import { writeRecordDocument } from "#metalbrain/records/operations/writeRecordDocument";
import { appendRecordTaps } from "#metalbrain/records/utils/appendRecordTaps";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages a tap at `at`, with `note` when given, on the `kind` entry `id`, appended
 * to its group file's `taps` list.
 *
 * @returns The entry's current ID.
 * @throws {Error} When the kind takes no taps, `findRecord` finds no entry `id`,
 * or the group would break the kind's schema, staging nothing.
 */
export async function tapRecord(
  filesystem: Filesystem,
  kind: RecordKind,
  id: string,
  { at, note, wordCap }: { at: string; note?: string; wordCap: number },
): Promise<string> {
  if (kind.taps !== true) {
    throw new Error(`The ${kind.name} records take no taps`);
  }

  const found = await findRecord(filesystem, kind, id);

  appendRecordTaps(found, [
    {
      id: found.id,
      at,
      ...(note !== undefined && { note }),
    },
  ]);

  await writeRecordDocument(filesystem, kind, found, { id: found.id, wordCap });

  return found.id;
}
