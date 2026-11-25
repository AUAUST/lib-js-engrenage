import { findRecord } from "#metalbrain/records/operations/findRecord";
import { removeRecordEntry } from "#metalbrain/records/operations/removeRecordEntry";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages the removal of the `kind` entry `id`, then regenerates the kind's index;
 * closing a group's last entry removes the group with its file.
 *
 * @returns The entry's current ID and group, and whether closing it
 * removed the group.
 * @throws {Error} When `findRecord` finds no entry `id`.
 */
export async function closeRecord(
  filesystem: Filesystem,
  kind: RecordKind,
  id: string,
): Promise<{ id: string; group: string; removed: boolean }> {
  const found = await findRecord(filesystem, kind, id);

  const removed = await removeRecordEntry(filesystem, found);

  await writeRecordIndex(filesystem, kind);

  return {
    id: found.id,
    group: found.group,
    removed,
  };
}
