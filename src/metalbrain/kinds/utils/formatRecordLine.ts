import { backlog } from "#metalbrain/backlog/constants";
import {
  formatBacklogEntryLine,
  formatBacklogEntryTitle,
} from "#metalbrain/backlog/index";
import { formatLogEntryLine } from "#metalbrain/logs/index";
import type { ListedRecord, RecordKind } from "#metalbrain/records/index";

// @debt the `category` flag branches backlog's line format only; a kind declaring its own line parts would let trees and lists compose them
/**
 * A listed entry of `kind` on one line, as its kind's `list` prints it, its tap
 * count closing the line once it has taps; `category: false` leaves out the
 * category output shows above the line.
 */
export function formatRecordLine(
  kind: RecordKind,
  record: ListedRecord,
  { category = true }: { category?: boolean } = {},
): string {
  const formatBacklog = category
    ? formatBacklogEntryLine
    : formatBacklogEntryTitle;

  const line = kind.name === backlog.name
    ? formatBacklog(record)
    : formatLogEntryLine(record);

  const { length } = record.taps;

  return length === 0
    ? line
    : `${line} (${length} tap${length === 1 ? "" : "s"})`;
}
