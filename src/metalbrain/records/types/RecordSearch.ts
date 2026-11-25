/**
 * How a record kind's entries rank in a search: each searchable field's weight,
 * keyed by `id`, a field of the kind or the `group` name.
 */
export interface RecordSearch {
  readonly weights: Readonly<Record<string, number>>;
  /**
   * The name the entry's group is searched under, for a kind keeping its
   * entries in group files.
   */
  readonly group?: string;
}
