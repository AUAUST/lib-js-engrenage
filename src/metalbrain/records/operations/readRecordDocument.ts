import { isSeq, parseDocument } from "yaml";

import { recordFileExtension } from "#metalbrain/records/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { File } from "#types/File";

/**
 * The `kind` group file `<group>.yml` as an editable YAML document, with
 * its `entries` list.
 *
 * @throws {Error} When the group is missing or unparsable, or holds no
 * `entries` list.
 */
export async function readRecordDocument(
  filesystem: Filesystem,
  kind: RecordKind,
  group: string,
) {
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

  return {
    file,
    group,
    document,
    entries,
  };
}
