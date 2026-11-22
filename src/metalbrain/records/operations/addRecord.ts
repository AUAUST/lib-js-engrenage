import { isSeq, parseDocument } from "yaml";

import { isString } from "@auaust/toolkit";

import { recordFileExtension } from "#metalbrain/records/constants";
import { createRecordId } from "#metalbrain/records/operations/createRecordId";
import { findRecordEntryViolations } from "#metalbrain/records/operations/findRecordEntryViolations";
import { listRecordIds } from "#metalbrain/records/operations/listRecordIds";
import { writeRecordIndex } from "#metalbrain/records/operations/writeRecordIndex";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";
import { throwViolations } from "#metalbrain/records/utils/throwViolations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordFieldType } from "#metalbrain/records/types/RecordFieldType";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { RecordValues } from "#metalbrain/records/types/RecordValues";
import type { File } from "#types/File";

function toValue(
  type: RecordFieldType,
  value: string | readonly string[] | undefined,
) {
  if (isString(value)) {
    return value;
  }

  if (value === undefined || value.length === 0) {
    return;
  }

  return type === "detail" && value.length === 1 ? value[0] : value;
}

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
  const file = `${kind.location.directory}/${group}${recordFileExtension}` satisfies File;

  const content = await filesystem.read(file);

  if (content === undefined) {
    throw new Error(
      `No ${kind.name} category "${group}": create it first with \`pnpm metalbrain ${kind.name} create ${group} "<purpose>"\``,
    );
  }

  const document = parseDocument(content);

  const [error] = document.errors;

  if (error !== undefined) {
    throw new Error(`${file}: invalid YAML: ${error.message}`);
  }

  const entries = document.get("entries");

  if (!isSeq(entries)) {
    throw new Error(`${file}: expected an \`entries\` list`);
  }

  const id = createRecordId(await listRecordIds(filesystem, kind), day);

  const fields: Readonly<
    Record<string, string | readonly string[] | undefined>
  > = values;

  const written = Object.entries(kind.fields).map(([key, type]) => {
    return [key, toValue(type, fields[key])] as const;
  });

  if (entries.items.length === 0) {
    entries.flow = false;
  }

  entries.add(
    document.createNode(
      Object.fromEntries([
        ["id", id],
        ...written.filter(([, value]) => value !== undefined),
      ]),
    ),
  );

  const updated = document.toString({
    lineWidth: 0,
    flowCollectionPadding: false,
  });

  const parsed = parseRecordGroup(kind, updated);

  if (parsed.kind === "invalid") {
    throw new Error(`${file}: invalid YAML: ${String(parsed.error)}`);
  }

  const added = parsed.entries.find(({ loose }) => loose.id === id);

  if (added === undefined) {
    throw new Error(`${file}: the added entry ${id} did not read back`);
  }

  throwViolations(
    `The entry would break the ${kind.name} file schema, so nothing was written:`,
    [
      ...formatSchemaIssues(file, parsed.issues),
      ...(await findRecordEntryViolations(
        filesystem,
        kind,
        `${file}: entry ${id}`,
        added,
        wordCap,
      )),
    ],
  );

  await filesystem.write(file, updated);

  await writeRecordIndex(filesystem, kind);

  return id;
}
