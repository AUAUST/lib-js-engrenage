import { renderDenseEntry } from "#nexus/reports/utils/renderDenseEntry";
import type { Printer } from "#nexus/reports/ports/Printer";

/**
 * Prints each entry as plain, dense text: results and completion lines to stdout,
 * every other report to stderr.
 */
export const densePrinter: Printer = {
  /** @printing */
  print(entry, kind) {
    const lines = renderDenseEntry(entry);

    if (lines.length === 0) {
      return;
    }

    const stream = kind === "log" || kind === "complete"
      ? process.stdout
      : process.stderr;

    stream.write(`${lines.join("\n")}\n`);
  },
};
