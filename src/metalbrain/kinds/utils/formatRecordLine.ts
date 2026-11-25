import { backlog } from "#metalbrain/backlog/constants";
import { formatBacklogEntryLine } from "#metalbrain/backlog/index";
import { formatLogEntryLine } from "#metalbrain/logs/index";
import type { ListedRecord, RecordKind } from "#metalbrain/records/index";

/**
 * A listed entry of `kind` on one line, as its kind's `list` prints it.
 */
export function formatRecordLine(
  kind: RecordKind,
  record: ListedRecord,
): string {
  return kind.name === backlog.name
    ? formatBacklogEntryLine(record)
    : formatLogEntryLine(record);
}
