import { recordFileExtension } from "#metalbrain/records/constants";
import { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { File } from "#types/File";

/**
 * The `kind` group file `<name>.yml` read through the kind's schema as
 * `parseRecordGroup` reads it; `undefined` when the file is missing.
 */
export async function readRecordGroup(
  filesystem: Filesystem,
  kind: RecordKind,
  name: string,
) {
  const file = `${kind.location.directory}/${name}${recordFileExtension}` satisfies File;

  const content = await filesystem.read(file);

  if (content !== undefined) {
    return {
      file,
      name,
      ...parseRecordGroup(kind, content),
    };
  }
}
