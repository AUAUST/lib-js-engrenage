import { isString } from "@auaust/toolkit";

import type { ListedRecord } from "#metalbrain/records/index";

/**
 * A listed log entry on one line, as the legacy logs wrote it: its ID, then
 * `<subject>: <second field> — <third field>`.
 */
export function formatLogEntryLine({ entry }: ListedRecord): string {
  const [id = "(no ID)", subject = "(no subject)", ...rest] = Object.values(
    entry,
  ).map((value) => {
    return isString(value) ? value : "(missing)";
  });

  return `${id} ${subject}: ${rest.join(" — ")}`;
}
