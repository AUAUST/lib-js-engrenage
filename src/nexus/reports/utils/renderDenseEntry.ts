import { max } from "@auaust/toolkit/math";

import { formatDuration } from "#nexus/reports/utils/formatDuration";
import { readReportText } from "#nexus/reports/utils/readReportText";
import type { ReportEntry } from "#nexus/reports/types/ReportEntry";
import type { TableEntry } from "#nexus/reports/types/TableEntry";
import type { TreeNode } from "#nexus/reports/types/TreeNode";

const indent = "  ";

const glyphs = {
  compact: {
    branch: "├ ",
    last: "└ ",
    through: "│ ",
    after: "  ",
  },
  ruled: {
    branch: "├─ ",
    last: "└─ ",
    through: "│  ",
    after: "   ",
  },
} as const;

function renderNodes(
  nodes: readonly TreeNode[],
  compact: boolean,
  branched: boolean,
  prefix: string,
): string[] {
  const {
    branch,
    last,
    through,
    after,
  } = glyphs[compact ? "compact" : "ruled"];

  return nodes.flatMap(({ label, children }, index) => {
    const isLast = index === nodes.length - 1;

    const line = branched
      ? `${prefix}${isLast ? last : branch}${readReportText(label)}`
      : `${prefix}${readReportText(label)}`;

    const nested = branched ? `${prefix}${isLast ? after : through}` : prefix;

    return [
      line,
      ...renderNodes(children, compact, !compact || !branched, nested),
    ];
  });
}

function renderTable({ title, columns, rows }: TableEntry): string[] {
  const cells = rows.map(({ cells: row, depth = 0 }) => {
    return row.map((cell, column) => {
      const text = readReportText(cell);

      return column === 0 ? `${indent.repeat(depth)}${text}` : text;
    });
  });

  const widths = columns.map((_column, index) => {
    return max(
      0,
      ...cells.map((row) => {
        return row[index]?.length ?? 0;
      }),
    );
  });

  const prefix = title === undefined ? "" : indent;

  const lines = cells.map((row) => {
    const padded = row.map((text, index) => {
      const width = widths[index] ?? 0;

      return columns[index]?.align === "end"
        ? text.padStart(width)
        : text.padEnd(width);
    });

    return `${prefix}${padded.join(indent)}`.trimEnd();
  });

  return title === undefined ? lines : [readReportText(title), ...lines];
}

/**
 * The lines `entry` prints as plain, dense text, styles dropped: nothing for an
 * entry holding no item, row or node.
 *
 * @pure
 */
export function renderDenseEntry(entry: ReportEntry): string[] {
  switch (entry.kind) {
    case "line": {
      const text = readReportText(entry.text);

      const line = entry.source === undefined
        ? text
        : `${entry.source}: ${text}`;

      return [
        entry.fix === undefined
          ? line
          : `${line}\n${indent}${readReportText(entry.fix)}`,
      ];
    }

    case "title": {
      return [readReportText(entry.text)];
    }

    case "completion": {
      const text = readReportText(entry.text);

      return [
        entry.duration === undefined
          ? text
          : `${text} (${formatDuration(entry.duration)})`,
      ];
    }

    case "list": {
      return entry.items.map((item) => {
        return `- ${readReportText(item)}`;
      });
    }

    case "table": {
      return entry.rows.length === 0 ? [] : renderTable(entry);
    }

    case "tree": {
      return renderNodes(entry.nodes, entry.compact, false, "");
    }

    case "stack": {
      return [entry.trace];
    }
  }
}
