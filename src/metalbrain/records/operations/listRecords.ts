import { readRecordGroup } from "#metalbrain/records/operations/readRecordGroup";
import { readRecordGroups } from "#metalbrain/records/operations/readRecordGroups";
import { orderRecordEntry } from "#metalbrain/records/utils/orderRecordEntry";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Every entry of the group files of `kind`, or of `group` alone, in file order,
 * each with its group, its `created`, its taps in list order, and its other keys
 * in the order the kind writes them.
 *
 * @throws {Error} When `group` is missing, or a group file read is unparsable.
 */
export async function listRecords(
  filesystem: Filesystem,
  kind: RecordKind,
  group?: string,
) {
  const groups = group === undefined
    ? await readRecordGroups(filesystem, kind)
    : [await readRecordGroup(filesystem, kind, group)];

  return groups.flatMap((read) => {
    if (read === undefined) {
      throw new Error(
        `No ${kind.name} category "${group}": list them with \`pnpm metalbrain ${kind.name} categories\``,
      );
    }

    if (read.kind === "invalid") {
      throw new Error(`${read.file}: invalid YAML: ${String(read.error)}`);
    }

    const taps = Map.groupBy(read.taps, ({ id }) => id);

    return read.entries.map(({ loose }) => {
      const { created, ...entry } = loose;

      return {
        group: read.name,
        created,
        taps: (loose.id === undefined ? undefined : taps.get(loose.id)) ?? [],
        entry: orderRecordEntry(kind, entry),
      };
    });
  });
}
