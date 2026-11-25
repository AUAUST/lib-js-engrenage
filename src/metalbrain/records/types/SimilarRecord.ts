import type { SearchedRecord } from "#metalbrain/records/types/SearchedRecord";

/**
 * An entry `findSimilarRecords` lists: the entry and its highest similarity to
 * the texts searched, `0` when it is listed only for a site naming a file.
 */
export interface SimilarRecord {
  readonly record: SearchedRecord;
  readonly similarity: number;
}
