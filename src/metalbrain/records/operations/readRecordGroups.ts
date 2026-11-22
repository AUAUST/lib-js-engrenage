import { posix } from "node:path";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import { readRecordGroup } from "#metalbrain/records/operations/readRecordGroup";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Every group file of `kind`, in name order, the generated index aside, read as
 * `readRecordGroup` reads it.
 */
export async function readRecordGroups(
  filesystem: Filesystem,
  kind: RecordKind,
) {
  const { directory } = kind.location;

  const files = await filesystem.glob(`${directory}/*${recordFileExtension}`);

  const names = files
    .map((file) => posix.basename(file, recordFileExtension))
    .filter((name) => name !== recordIndexName);

  return Promise.all(
    names.map(async (name) => {
      const group = await readRecordGroup(filesystem, kind, name);

      if (group === undefined) {
        throw new Error(
          `${directory}/${name}${recordFileExtension}: listed by the ${kind.name} glob but unreadable`,
        );
      }

      return group;
    }),
  );
}
