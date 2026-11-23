import { posix } from "node:path";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import { readRecordGroup } from "#metalbrain/records/operations/readRecordGroup";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

async function listGroupNames(
  filesystem: Filesystem,
  kind: RecordKind,
): Promise<string[]> {
  const { location } = kind;

  if (!("directory" in location)) {
    return (await filesystem.exists(location.file)) ? [kind.name] : [];
  }

  const files = await filesystem.glob(
    `${location.directory}/*${recordFileExtension}`,
  );

  return files
    .map((file) => posix.basename(file, recordFileExtension))
    .filter((name) => name !== recordIndexName);
}

/**
 * Every group file of `kind`, in name order, the generated index aside, read as
 * `readRecordGroup` reads it: none for a kind keeping one file not yet written.
 */
export async function readRecordGroups(
  filesystem: Filesystem,
  kind: RecordKind,
) {
  const names = await listGroupNames(filesystem, kind);

  return Promise.all(
    names.map(async (name) => {
      const group = await readRecordGroup(filesystem, kind, name);

      if (group === undefined) {
        throw new Error(
          `The ${kind.name} group "${name}" is listed but unreadable`,
        );
      }

      return group;
    }),
  );
}
