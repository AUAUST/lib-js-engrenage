import { isString } from "@auaust/toolkit";

import type { ListedRecord } from "#metalbrain/records/index";

/**
 * A listed backlog entry on one line: its ID, its category and its title.
 */
export function formatBacklogEntryLine({ group, entry }: ListedRecord): string {
  const { id, title } = entry;

  return `${isString(id) ? id : "(no ID)"} ${group}: ${isString(title) ? title : "(no title)"}`;
}
