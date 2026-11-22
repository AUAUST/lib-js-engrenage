import { parse, record, string, unknown } from "valibot";
import { isMap } from "yaml";

import { readRecordDocument } from "#metalbrain/records/operations/readRecordDocument";
import { readRecordIndex } from "#metalbrain/records/operations/readRecordIndex";
import { isRecordId } from "#metalbrain/records/utils/isRecordId";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

const entrySchema = record(string(), unknown());

/**
 * The `kind` entry `id`, found through the kind's index: its group file as an
 * editable document, the entry's position in its `entries` list, its node, and
 * the entry as the file holds it.
 *
 * @throws {Error} When `id` has no entry ID's form, the index lists no entry
 * `id`, or its group file lacks it.
 */
export async function findRecord(
  filesystem: Filesystem,
  kind: RecordKind,
  id: string,
) {
  if (!isRecordId(id)) {
    throw new Error(
      `"${id}": expected a ${kind.name} entry ID as YYMMDD-xxxx, 4 hex characters`,
    );
  }

  const index = await readRecordIndex(filesystem, kind);

  const [group] = (
    Object.entries(index).find(([, { entries }]) => entries.includes(id)) ?? []
  );

  if (group === undefined) {
    throw new Error(
      `No ${kind.name} entry ${id}: find entries with \`pnpm metalbrain ${kind.name} search <keyword>\``,
    );
  }

  const document = await readRecordDocument(filesystem, kind, group);

  const position = document.entries.items.findIndex((item) => {
    return isMap(item) && item.get("id") === id;
  });

  const node = document.entries.items[position];

  if (!isMap(node)) {
    throw new Error(
      `${document.file}: the ${kind.name} index lists the entry ${id}, the file lacks it`,
    );
  }

  return {
    ...document,
    position,
    node,
    entry: parse(entrySchema, node.toJSON()),
  };
}
