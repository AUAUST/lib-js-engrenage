import { isString } from "@auaust/toolkit";

import type { ListedRecord } from "#metalbrain/records/index";

/**
 * A listed backlog entry on one line without its category, for output showing
 * the category above it: its ID and its title.
 */
export function formatBacklogEntryTitle({ entry }: ListedRecord): string {
  const { id, title } = entry;

  return `${isString(id) ? id : "(no ID)"} ${isString(title) ? title : "(no title)"}`;
}
