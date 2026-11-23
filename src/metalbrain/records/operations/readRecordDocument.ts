import { isSeq, parseDocument } from "yaml";

import { resolveRecordFile } from "#metalbrain/records/utils/resolveRecordFile";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * The file of the `kind` group `group` as an editable YAML document, with
 * its `entries` list; a kind keeping one file reads a missing file as
 * holding no entries.
 *
 * @throws {Error} When a group of a kind keeping a directory is missing, or the
 * file is unparsable or holds no `entries` list.
 */
export async function readRecordDocument(
  filesystem: Filesystem,
  kind: RecordKind,
  group: string,
) {
  const file = resolveRecordFile(kind, group);

  const content = await filesystem.read(file);

  if (content === undefined && "directory" in kind.location) {
    throw new Error(
      `No ${kind.name} category "${group}": create it first with \`pnpm metalbrain ${kind.name} create ${group} "<purpose>"\``,
    );
  }

  const document = parseDocument(content ?? "entries: []\n");

  const [error] = document.errors;

  if (error !== undefined) {
    throw new Error(`${file}: invalid YAML: ${error.message}`);
  }

  const entries = document.get("entries");

  if (!isSeq(entries)) {
    throw new Error(`${file}: expected an \`entries\` list`);
  }

  return {
    file,
    group,
    document,
    entries,
  };
}
