import { findRecordEntryViolations } from "#metalbrain/records/operations/findRecordEntryViolations";
import { formatRecordDocument } from "#metalbrain/records/utils/formatRecordDocument";
import { formatSchemaIssues } from "#metalbrain/records/utils/formatSchemaIssues";
import { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";
import { throwViolations } from "#metalbrain/records/utils/throwViolations";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordDocument } from "#metalbrain/records/types/RecordDocument";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Stages `record`'s group file once the group and its entry `id`, which an edit
 * just wrote, pass the kind's schema, leaving the index as it is.
 *
 * @throws {Error} When the group or that entry would break the kind's schema,
 * staging nothing.
 */
export async function writeRecordDocument(
  filesystem: Filesystem,
  kind: RecordKind,
  { file, document }: RecordDocument,
  { id, wordCap }: { id: string; wordCap: number },
): Promise<void> {
  const content = formatRecordDocument(document);

  const parsed = parseRecordGroup(kind, content);

  if (parsed.kind === "invalid") {
    throw new Error(`${file}: invalid YAML: ${String(parsed.error)}`);
  }

  const written = parsed.entries.find(({ loose }) => loose.id === id);

  if (written === undefined) {
    throw new Error(`${file}: the entry ${id} did not read back`);
  }

  throwViolations(
    `The entry would break the ${kind.name} file schema, so nothing was written:`,
    [
      ...formatSchemaIssues(file, parsed.issues),
      ...(await findRecordEntryViolations(
        filesystem,
        kind,
        `${file}: entry ${id}`,
        written,
        wordCap,
      )),
    ],
  );

  await filesystem.write(file, content);
}
