import { exactOptional, object, parse, string } from "valibot";
import { isMap, isSeq } from "yaml";

import type { RecordDocument } from "#metalbrain/records/types/RecordDocument";
import type { RecordTap } from "#metalbrain/records/types/RecordTap";

const tapSchema = object({
  id: string(),
  at: string(),
  note: exactOptional(string()),
});

/**
 * The taps of the entry `id` in the `taps` list of `record`, in list order.
 *
 * @throws {Error} When one of them departs from the tap shape.
 */
export function listRecordTaps(
  { document }: RecordDocument,
  id: string,
): RecordTap[] {
  const list = document.get("taps");

  if (!isSeq(list)) {
    return [];
  }

  return list.items.flatMap((item) => {
    return isMap(item) && item.get("id") === id
      ? [parse(tapSchema, item.toJSON())]
      : [];
  });
}
