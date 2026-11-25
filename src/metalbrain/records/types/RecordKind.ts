import type { RecordFields } from "#metalbrain/records/types/RecordFields";
import type { RecordLocation } from "#metalbrain/records/types/RecordLocation";
import type { RecordSearch } from "#metalbrain/records/types/RecordSearch";

/**
 * A record kind's declaration, all the record core needs to store, check,
 * index and count its entries; `WordCap` is the config word cap key bounding
 * an entry's words.
 */
export interface RecordKind<WordCap extends string = string> {
  /**
   * The kind's command group, as in `pnpm metalbrain <name> …`.
   */
  readonly name: string;
  /**
   * The uppercase letters opening each entry ID, unique across kinds.
   */
  readonly namespace: string;
  readonly location: RecordLocation;
  readonly fields: RecordFields;
  /**
   * The most `detail` items an entry may hold across its detail fields.
   */
  readonly detailLimit: number;
  readonly wordCap: WordCap;
  /**
   * The text field `countRecords` counts entries by.
   */
  readonly groupBy?: string;
  /**
   * The text field naming an entry in a few words, which a merge's tap
   * note defaults to.
   */
  readonly title?: string;
  /**
   * The fields searches rank entries on; a kind without it is not searchable.
   */
  readonly search?: RecordSearch;
  /**
   * Whether entries take taps, each recording when the entry mattered again.
   */
  readonly taps?: boolean;
}
