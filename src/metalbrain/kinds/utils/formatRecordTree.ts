import { formatRecordLine } from "#metalbrain/kinds/utils/formatRecordLine";
import { paintRecordTree } from "#metalbrain/kinds/utils/paintRecordTree";
import type { SearchedRecord } from "#metalbrain/records/index";

/**
 * The lines painting `records` as `paintRecordTree` does, every entry as
 * `formatRecordLine` prints it without its category.
 */
export function formatRecordTree(records: readonly SearchedRecord[]): string[] {
  return paintRecordTree(records, (kind, record) => {
    return {
      line: formatRecordLine(kind, record, { category: false }),
      children: [],
    };
  });
}
