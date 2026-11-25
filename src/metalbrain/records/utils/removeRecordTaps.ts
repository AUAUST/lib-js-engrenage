import { isMap, isSeq } from "yaml";

import { listRecordTaps } from "#metalbrain/records/utils/listRecordTaps";
import type { RecordDocument } from "#metalbrain/records/types/RecordDocument";
import type { RecordTap } from "#metalbrain/records/types/RecordTap";

/**
 * Removes the taps of the entry `id` from the `taps` list of `record`, the list
 * with them once empty.
 *
 * @returns The removed taps, in list order.
 * @throws {Error} When one of them departs from the tap shape.
 */
export function removeRecordTaps(
  record: RecordDocument,
  id: string,
): RecordTap[] {
  const removed = listRecordTaps(record, id);

  const { document } = record;

  const list = document.get("taps");

  if (!isSeq(list)) {
    return removed;
  }

  list.items = list.items.filter((item) => {
    return !isMap(item) || item.get("id") !== id;
  });

  if (list.items.length === 0) {
    document.delete("taps");
  }

  return removed;
}
