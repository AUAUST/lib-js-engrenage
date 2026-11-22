import type { RecordFields } from "#metalbrain/records/types/RecordFields";
import type { RecordLocation } from "#metalbrain/records/types/RecordLocation";

/**
 * A record kind's declaration, all the record core needs to store, check and
 * index its entries; `Budget` is the config budget key bounding an entry's words.
 */
export interface RecordKind<Budget extends string = string> {
  /**
   * The kind's command group, as in `pnpm metalbrain <name> …`.
   */
  readonly name: string;
  readonly location: RecordLocation;
  readonly fields: RecordFields;
  /**
   * The most `detail` items an entry may hold across its detail fields.
   */
  readonly detailLimit: number;
  readonly budget: Budget;
}
