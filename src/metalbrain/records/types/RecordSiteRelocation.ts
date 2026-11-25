/**
 * A code site of the entry `id` rewritten after a file or directory moved.
 */
export interface RecordSiteRelocation {
  readonly id: string;
  readonly site: string;
  readonly relocated: string;
}
