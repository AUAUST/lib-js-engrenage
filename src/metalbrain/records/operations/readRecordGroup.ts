import { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";
import { resolveRecordFile } from "#metalbrain/records/utils/resolveRecordFile";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * The `kind` group `name`, its file read through the kind's schema as
 * `parseRecordGroup` reads it; `undefined` when the file is missing.
 */
export async function readRecordGroup(
  filesystem: Filesystem,
  kind: RecordKind,
  name: string,
) {
  const file = resolveRecordFile(kind, name);

  const content = await filesystem.read(file);

  if (content !== undefined) {
    return {
      file,
      name,
      ...parseRecordGroup(kind, content),
    };
  }
}
