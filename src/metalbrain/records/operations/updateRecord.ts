import { findRecord } from "#metalbrain/records/operations/findRecord";
import { writeRecordDocument } from "#metalbrain/records/operations/writeRecordDocument";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import { sortRecordEntryNode } from "#metalbrain/records/utils/sortRecordEntryNode";
import { toRecordValue } from "#metalbrain/records/utils/toRecordValue";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordChanges } from "#metalbrain/records/types/RecordChanges";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages the `kind` entry `id` with each field `values` gives replaced, written
 * as `addRecord` writes it, and each `unset` field removed, its ID and other
 * fields kept as written, its keys in the kind's order, then regenerates
 * the kind's index.
 *
 * @throws {Error} When the update changes nothing, `unset` names a field the
 * kind lacks, a required one or one `values` gives, `findRecord` finds no entry
 * `id`, or the entry would break the kind's schema, staging nothing.
 */
export async function updateRecord<Kind extends RecordKind>(
  filesystem: Filesystem,
  kind: Kind,
  id: string,
  {
    values,
    unset,
  }: {
    values: RecordChanges<Kind["fields"]>;
    unset: readonly string[];
  },
  { wordCap }: { wordCap: number },
): Promise<void> {
  const fields: Readonly<
    Record<string, string | readonly string[] | undefined>
  > = values;

  const replaced = Object.entries(kind.fields).flatMap(([key, type]) => {
    const value = toRecordValue(type, fields[key]);

    return value === undefined ? [] : [[key, value] as const];
  });

  if (replaced.length === 0 && unset.length === 0) {
    throw new Error(
      `Nothing to update in the ${kind.name} entry ${id}: give a field to replace or unset`,
    );
  }

  for (const key of unset) {
    const type = kind.fields[key];

    if (type === undefined || type === "text") {
      throw new Error(
        `Cannot unset "${key}" of a ${kind.name} entry: expected one of ${Object.keys(
          kind.fields,
        )
          .filter((field) => kind.fields[field] !== "text")
          .join(", ")}`,
      );
    }

    if (fields[key] !== undefined) {
      throw new Error(
        `Cannot both replace and unset "${key}" of the ${kind.name} entry ${id}`,
      );
    }
  }

  const found = await findRecord(filesystem, kind, id);

  const { document, node } = found;

  for (const [key, value] of replaced) {
    node.set(key, document.createNode(value));
  }

  for (const key of unset) {
    node.delete(key);
  }

  sortRecordEntryNode(kind, node);

  await writeRecordDocument(filesystem, kind, found, { id, wordCap });

  await writeRecordIndex(filesystem, kind);
}
