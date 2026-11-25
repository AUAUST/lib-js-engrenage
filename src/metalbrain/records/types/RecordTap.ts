/**
 * One time an entry mattered again, as its group file's `taps` list holds it:
 * the entry's ID, the UTC time and an optional one-line note.
 */
export interface RecordTap {
  readonly id: string;
  readonly at: string;
  readonly note?: string;
}
