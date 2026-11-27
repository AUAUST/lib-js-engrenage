import { createRecordTree } from "#metalbrain/kinds/utils/createRecordTree";
import { formatRecordLine } from "#metalbrain/kinds/utils/formatRecordLine";
import type { SearchedRecord } from "#metalbrain/records/index";
import type { TreeEntry } from "#nexus/reports/index";

/**
 * The tree of `records` as `createRecordTree` makes it, every entry as
 * `formatRecordLine` prints it without its category.
 */
export function formatRecordTree(
  records: readonly SearchedRecord[],
): TreeEntry {
  return createRecordTree(records, (kind, record) => {
    return {
      label: formatRecordLine(kind, record, { category: false }),
      children: [],
    };
  });
}
