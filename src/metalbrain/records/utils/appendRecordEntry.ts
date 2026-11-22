import { orderRecordEntry } from "#metalbrain/records/utils/orderRecordEntry";
import type { RecordDocument } from "#metalbrain/records/types/RecordDocument";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * Appends `entry` to the `entries` list of `record`, its keys in the order `kind`
 * writes them, turning an empty flow list into a block list.
 */
export function appendRecordEntry(
  kind: RecordKind,
  { document, entries }: RecordDocument,
  entry: Readonly<Record<string, unknown>>,
): void {
  if (entries.items.length === 0) {
    entries.flow = false;
  }

  entries.add(document.createNode(orderRecordEntry(kind, entry)));
}
