import { treeEntry, type TreeEntry, type TreeNode } from "#nexus/reports/index";
import type { RecordKind, SearchedRecord } from "#metalbrain/records/index";

function groupNodes(
  kind: RecordKind,
  records: readonly SearchedRecord[],
  toNode: (kind: RecordKind, record: SearchedRecord) => TreeNode,
): TreeNode[] {
  if (!("directory" in kind.location)) {
    return records.map((record) => {
      return toNode(kind, record);
    });
  }

  return [...Map.groupBy(records, ({ group }) => group)].map(
    ([group, entries]) => {
      return {
        label: `${group}:`,
        children: entries.map((record) => {
          return toNode(kind, record);
        }),
      };
    },
  );
}

/**
 * The compact tree of `records`: each kind under its name, then, for a kind
 * keeping categories, each category under it, then each entry as `toNode` makes
 * it, in the order they first appear.
 */
export function createRecordTree(
  records: readonly SearchedRecord[],
  toNode: (kind: RecordKind, record: SearchedRecord) => TreeNode,
): TreeEntry {
  const kinds = [...Map.groupBy(records, ({ kind }) => kind)].map(
    ([kind, entries]) => {
      return {
        label: `${kind.name}:`,
        children: groupNodes(kind, entries, toNode),
      };
    },
  );

  return treeEntry(kinds, { compact: true });
}
