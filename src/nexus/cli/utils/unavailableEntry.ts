import { join } from "@auaust/toolkit/array";

import { dataEntry, tableEntry, type DataEntry } from "#nexus/reports/index";
import type { HelpUnavailable } from "#nexus/cli/types/HelpUnavailable";

/**
 * The entry listing `unavailable`, the commands a help lists apart: their value
 * for machines, and for people and agents each command's path, its aliases and
 * the reason it is unavailable.
 *
 * @pure
 */
export function unavailableEntry(
  unavailable: readonly HelpUnavailable[],
): DataEntry {
  return dataEntry(unavailable, [
    tableEntry({
      title: "Unavailable commands",
      columns: [{ align: "start" }, { align: "start" }],
      rows: unavailable.map(({ path, aliases, reason }) => {
        return {
          cells: [
            `${join(path, " ")}${aliases.length > 0 ? ` (aliases: ${join(aliases, ", ")})` : ""}`,
            reason,
          ],
          depth: 0,
        };
      }),
    }),
  ]);
}
