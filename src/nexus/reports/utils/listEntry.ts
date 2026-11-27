import type { ListEntry } from "#nexus/reports/types/ListEntry";
import type { ReportText } from "#nexus/reports/types/ReportText";

/**
 * A list reporting `items` one after another.
 *
 * @pure
 */
export function listEntry(items: readonly ReportText[]): ListEntry {
  return { kind: "list", items };
}
