import type { FoundRecord } from "#metalbrain/records/types/FoundRecord";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";

/**
 * An entry found from the ID a command was given, possibly a former one: that
 * ID, the entry's kind and the entry as `findRecord` finds it.
 */
export interface LocatedRecord {
  readonly given: string;
  readonly kind: RecordKind;
  readonly found: FoundRecord;
}
