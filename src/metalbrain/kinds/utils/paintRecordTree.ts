import type { RecordTreeNode } from "#metalbrain/kinds/types/RecordTreeNode";
import type { RecordKind, SearchedRecord } from "#metalbrain/records/index";

function paintNodes(
  nodes: readonly RecordTreeNode[],
  branched: boolean,
  prefix: string,
): string[] {
  return nodes.flatMap(({ line, children }, index) => {
    if (!branched) {
      return [`${prefix}${line}`, ...paintNodes(children, true, prefix)];
    }

    const last = index === nodes.length - 1;

    return [
      `${prefix}${last ? "└" : "├"} ${line}`,
      ...paintNodes(children, false, `${prefix}${last ? " " : "│"} `),
    ];
  });
}

function groupNodes(
  kind: RecordKind,
  records: readonly SearchedRecord[],
  toNode: (kind: RecordKind, record: SearchedRecord) => RecordTreeNode,
): RecordTreeNode[] {
  if (!("directory" in kind.location)) {
    return records.map((record) => {
      return toNode(kind, record);
    });
  }

  return [...Map.groupBy(records, ({ group }) => group)].map(
    ([group, entries]) => {
      return {
        line: `${group}:`,
        children: entries.map((record) => {
          return toNode(kind, record);
        }),
      };
    },
  );
}

/**
 * The lines painting `records` as a thin tree: each kind under its name, then,
 * for a kind keeping categories, each category under it, then each entry as
 * `toNode` makes it, in the order they first appear; each level branches with
 * box-drawing characters, or is indented under a branched line.
 */
export function paintRecordTree(
  records: readonly SearchedRecord[],
  toNode: (kind: RecordKind, record: SearchedRecord) => RecordTreeNode,
): string[] {
  const kinds = [...Map.groupBy(records, ({ kind }) => kind)].map(
    ([kind, entries]) => {
      return {
        line: `${kind.name}:`,
        children: groupNodes(kind, entries, toNode),
      };
    },
  );

  return paintNodes(kinds, false, "");
}
