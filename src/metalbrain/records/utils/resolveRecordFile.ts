import { recordFileExtension } from "#metalbrain/records/constants";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { File } from "#types/File";

/**
 * The file holding the `kind` group `group`: `<group>.yml` in the kind's
 * directory, or the kind's one file, whose only group is named after the kind.
 *
 * @throws {Error} When the kind keeps one file and `group` is not its name.
 */
export function resolveRecordFile(kind: RecordKind, group: string): File {
  const { location } = kind;

  if ("directory" in location) {
    return `${location.directory}/${group}${recordFileExtension}`;
  }

  if (group !== kind.name) {
    throw new Error(
      `The ${kind.name} records keep one file, ${location.file}, without categories: "${group}" names none`,
    );
  }

  return location.file;
}
