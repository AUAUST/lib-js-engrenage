import { posix } from "node:path";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import { parseRecordGroup } from "#metalbrain/records/utils/parseRecordGroup";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Every group file of `kind`, in name order, the generated index aside, read
 * through the kind's schema as `parseRecordGroup` reads it.
 */
export async function readRecordGroups(
  filesystem: Filesystem,
  kind: RecordKind,
) {
  const { directory } = kind.location;

  const files = await filesystem.glob(`${directory}/*${recordFileExtension}`);

  const groups = files.filter((file) => {
    return posix.basename(file, recordFileExtension) !== recordIndexName;
  });

  return Promise.all(
    groups.map(async (file) => {
      const content = await filesystem.read(file);

      if (content === undefined) {
        throw new Error(
          `${file}: listed by the ${kind.name} glob but unreadable`,
        );
      }

      return {
        file,
        name: posix.basename(file, recordFileExtension),
        ...parseRecordGroup(kind, content),
      };
    }),
  );
}
