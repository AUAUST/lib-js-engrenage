import { createRecordId } from "#metalbrain/records/operations/createRecordId";
import { listRecordIds } from "#metalbrain/records/operations/listRecordIds";
import { readRecordDocument } from "#metalbrain/records/operations/readRecordDocument";
import { writeRecordDocument } from "#metalbrain/records/operations/writeRecordDocument";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import { appendRecordEntry } from "#metalbrain/records/utils/appendRecordEntry";
import { toRecordValue } from "#metalbrain/records/utils/toRecordValue";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { RecordValues } from "#metalbrain/records/types/RecordValues";

/**
 * Stages a new entry at the end of the `kind` group file `<group>.yml`, leaving
 * its other entries as they are, then regenerates the kind's index: an ID of
 * `day` no entry holds, then each field in the kind's order, a detail of one
 * item written as text.
 *
 * @returns The new entry's ID.
 * @throws {Error} When the group is missing or unparsable, or the entry or its
 * group would break the kind's schema.
 */
export async function addRecord<Kind extends RecordKind>(
  filesystem: Filesystem,
  kind: Kind,
  group: string,
  values: RecordValues<Kind["fields"]>,
  { day, wordCap }: { day: Date; wordCap: number },
): Promise<string> {
  const record = await readRecordDocument(filesystem, kind, group);

  const id = createRecordId(await listRecordIds(filesystem, kind), day);

  const fields: Readonly<
    Record<string, string | readonly string[] | undefined>
  > = values;

  appendRecordEntry(kind, record, {
    id,
    ...Object.fromEntries(
      Object.entries(kind.fields).map(([key, { type }]) => {
        return [key, toRecordValue(type, fields[key])];
      }),
    ),
  });

  await writeRecordDocument(filesystem, kind, record, { id, wordCap });

  await writeRecordIndex(filesystem, kind);

  return id;
}
