import { stringify } from "yaml";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import { readRecordGroups } from "#metalbrain/records/operations/readRecordGroups";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { File } from "#types/File";

/**
 * Stages the generated `index.yml` of `kind`: each group's name, `purpose` and
 * entry IDs, in name order, so a lookup reads one file.
 */
export async function writeRecordIndex(
  filesystem: Filesystem,
  kind: RecordKind,
): Promise<File> {
  const file = `${kind.location.directory}/${recordIndexName}${recordFileExtension}` satisfies File;

  const groups = await readRecordGroups(filesystem, kind);

  const index = Object.fromEntries(
    groups.map((group) => {
      if (group.kind === "invalid") {
        return [group.name, { entries: [] }];
      }

      const ids = group.entries.flatMap(({ loose }) => {
        return loose.id ?? [];
      });

      return [
        group.name,
        {
          purpose: group.purpose,
          entries: ids,
        },
      ];
    }),
  );

  await filesystem.write(
    file,
    `# Generated from the ${kind.name} files by every ${kind.name} write. Do not edit.\n${stringify(index, { lineWidth: 0 })}`,
  );

  return file;
}
