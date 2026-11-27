import { readReportText } from "#nexus/reports/utils/readReportText";
import type { Printer } from "#nexus/reports/ports/Printer";
import type { ReportEntry } from "#nexus/reports/types/ReportEntry";
import type { TreeNode } from "#nexus/reports/types/TreeNode";

interface JsonNode {
  readonly label: string;
  readonly children: readonly JsonNode[];
}

function readNodes(nodes: readonly TreeNode[]): JsonNode[] {
  return nodes.map(({ label, children }) => {
    return {
      label: readReportText(label),
      children: readNodes(children),
    };
  });
}

function readFields(
  entry: Exclude<ReportEntry, { kind: "data" }>,
): Readonly<Record<string, unknown>> {
  switch (entry.kind) {
    case "line": {
      return {
        text: readReportText(entry.text),
        source: entry.source,
        fix: entry.fix === undefined ? undefined : readReportText(entry.fix),
      };
    }

    case "title": {
      return { text: readReportText(entry.text) };
    }

    case "completion": {
      return {
        text: readReportText(entry.text),
        duration: entry.duration,
      };
    }

    case "list": {
      return { items: entry.items.map(readReportText) };
    }

    case "table": {
      return {
        title: entry.title === undefined
          ? undefined
          : readReportText(entry.title),
        columns: entry.columns,
        rows: entry.rows.map(({ cells, depth }) => {
          return {
            cells: cells.map(readReportText),
            depth,
          };
        }),
      };
    }

    case "tree": {
      return {
        compact: entry.compact,
        nodes: readNodes(entry.nodes),
      };
    }

    case "stack": {
      return { trace: entry.trace };
    }
  }
}

/**
 * Prints each entry as one JSON line: a data entry as its value, any other as
 * the reporter method it came through, its kind and its fields, text read plain;
 * results and completion lines go to stdout, every other report to stderr.
 */
export const jsonPrinter: Printer = {
  /** @printing */
  print(entry, kind) {
    const json = entry.kind === "data"
      ? JSON.stringify(entry.value ?? null)
      : JSON.stringify({
          report: kind,
          kind: entry.kind,
          ...readFields(entry),
        });

    const stream = kind === "log" || kind === "complete"
      ? process.stdout
      : process.stderr;

    stream.write(`${json}\n`);
  },
};
