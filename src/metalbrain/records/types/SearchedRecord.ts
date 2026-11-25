import type { ListedRecord } from "#metalbrain/records/types/ListedRecord";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * A listed entry searched among several kinds, with its kind.
 */
export interface SearchedRecord extends ListedRecord {
  readonly kind: RecordKind;
}
