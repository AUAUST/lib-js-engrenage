import { findRecord } from "#metalbrain/records/operations/findRecord";
import { readRecordDocument } from "#metalbrain/records/operations/readRecordDocument";
import { removeRecordEntry } from "#metalbrain/records/operations/removeRecordEntry";
import { writeRecordDocument } from "#metalbrain/records/operations/writeRecordDocument";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import { appendRecordEntry } from "#metalbrain/records/utils/appendRecordEntry";
import type { Filesystem } from "#foundation/filesystem/index";
import type { GroupedRecordKind } from "#metalbrain/records/types/GroupedRecordKind";

/**
 * Stages the `kind` entry `id`, its ID kept, at the end of the group file
 * `<group>.yml`, then its removal from its current group as `closeRecord` does,
 * then regenerates the kind's index.
 *
 * @returns The entry's current ID and former group, and whether moving it
 * removed that group.
 * @throws {Error} When `findRecord` finds no entry `id`, the entry already
 * belongs to `group`, `group` is missing, or the entry would break the kind's
 * schema there, staging nothing.
 */
export async function moveRecord(
  filesystem: Filesystem,
  kind: GroupedRecordKind,
  id: string,
  group: string,
  { wordCap }: { wordCap: number },
): Promise<{ id: string; group: string; removed: boolean }> {
  const found = await findRecord(filesystem, kind, id);

  if (found.group === group) {
    throw new Error(
      `The ${kind.name} entry ${found.id} already belongs to ${group}`,
    );
  }

  const target = await readRecordDocument(filesystem, kind, group);

  appendRecordEntry(kind, target, found.entry);

  await writeRecordDocument(filesystem, kind, target, {
    id: found.id,
    wordCap,
  });

  const removed = await removeRecordEntry(filesystem, found);

  await writeRecordIndex(filesystem, kind);

  return {
    id: found.id,
    group: found.group,
    removed,
  };
}
