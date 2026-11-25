import { formatRecordLine } from "#metalbrain/kinds/utils/formatRecordLine";
import type { RecordKind, SearchedRecord } from "#metalbrain/records/index";

function formatBranches(lines: readonly string[]): string[] {
  return lines.map((line, index) => {
    return `${index === lines.length - 1 ? "└" : "├"} ${line}`;
  });
}

function formatCategories(
  kind: RecordKind,
  records: readonly SearchedRecord[],
): string[] {
  const categories = [...Map.groupBy(records, ({ group }) => group)];

  return categories.flatMap(([category, entries], index) => {
    const last = index === categories.length - 1;

    return [
      `${last ? "└" : "├"} ${category}:`,
      ...entries.map((record) => {
        return `${last ? " " : "│"} ${formatRecordLine(kind, record, { category: false })}`;
      }),
    ];
  });
}

/**
 * The lines painting `records` as a tree: each kind under its name, then, for a
 * kind keeping categories, each category under it with its entries, every entry
 * as `formatRecordLine` prints it without its category; kinds, categories and
 * entries keep the order they first appear in.
 */
export function formatRecordTree(records: readonly SearchedRecord[]): string[] {
  const kinds = Map.groupBy(records, ({ kind }) => kind);

  return [...kinds].flatMap(([kind, entries]) => {
    return [
      `${kind.name}:`,
      ...("directory" in kind.location
        ? formatCategories(kind, entries)
        : formatBranches(
            entries.map((record) => {
              return formatRecordLine(kind, record);
            }),
          )),
    ];
  });
}
