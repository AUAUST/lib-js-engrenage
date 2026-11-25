import { backlog } from "#metalbrain/backlog/constants";
import { formatBacklogEntryLine } from "#metalbrain/backlog/index";
import { formatLogEntryLine } from "#metalbrain/logs/index";
import type { ListedRecord, RecordKind } from "#metalbrain/records/index";

/**
 * A listed entry of `kind` on one line, as its kind's `list` prints it, its tap
 * count closing the line once it has taps.
 */
export function formatRecordLine(
  kind: RecordKind,
  record: ListedRecord,
): string {
  const line = kind.name === backlog.name
    ? formatBacklogEntryLine(record)
    : formatLogEntryLine(record);

  const { length } = record.taps;

  return length === 0
    ? line
    : `${line} (${length} tap${length === 1 ? "" : "s"})`;
}
