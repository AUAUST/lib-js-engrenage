import { max } from "@auaust/toolkit/math";

import { formatDuration } from "#nexus/reports/utils/formatDuration";
import { readReportText } from "#nexus/reports/utils/readReportText";
import type { EntryPainter } from "#nexus/reports/types/EntryPainter";
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
  {
    compact,
    branched,
    prefix,
  }: {
    compact: boolean;
    branched: boolean;
    prefix: string;
  },
  painter: EntryPainter,
): string[] {
  const {
    branch,
    last,
    through,
    after,
  } = glyphs[compact ? "compact" : "ruled"];

  return nodes.flatMap(({ label, children }, index) => {
    const isLast = index === nodes.length - 1;

    const lead = branched ? `${prefix}${isLast ? last : branch}` : prefix;

    const nested = branched ? `${prefix}${isLast ? after : through}` : prefix;

    return [
      `${painter.mark(lead)}${painter.text(label)}`,
      ...renderNodes(
        children,
        {
          compact,
          branched: !compact || !branched,
          prefix: nested,
        },
        painter,
      ),
    ];
  });
}

function renderTable(
  { title, columns, rows }: TableEntry,
  painter: EntryPainter,
): string[] {
  const cells = rows.map(({ cells: row, depth = 0 }) => {
    return row.map((cell, column) => {
      const lead = column === 0 ? indent.repeat(depth) : "";

      return {
        width: lead.length + readReportText(cell).length,
        painted: `${lead}${painter.text(cell)}`,
      };
    });
  });

  const widths = columns.map((_column, index) => {
    return max(
      0,
      ...cells.map((row) => {
        return row[index]?.width ?? 0;
      }),
    );
  });

  const prefix = title === undefined ? "" : indent;

  const lines = cells.map((row) => {
    const padded = row.map(({ width, painted }, index) => {
      const padding = " ".repeat((widths[index] ?? 0) - width);

      return columns[index]?.align === "end"
        ? `${padding}${painted}`
        : `${painted}${padding}`;
    });

    return `${prefix}${padded.join(indent)}`.trimEnd();
  });

  return title === undefined
    ? lines
    : [painter.heading(painter.text(title)), ...lines];
}

/**
 * The lines `entry` prints as `painter` paints them: nothing for an entry
 * holding no item, row or node.
 *
 * @pure
 */
export function renderEntry(
  entry: ReportEntry,
  painter: EntryPainter,
): string[] {
  switch (entry.kind) {
    case "line": {
      const text = painter.text(entry.text);

      const line = entry.source === undefined
        ? text
        : `${painter.text([{ text: entry.source, style: "path" }])}: ${text}`;

      return [
        entry.fix === undefined
          ? line
          : `${line}\n${indent}${painter.text(entry.fix)}`,
      ];
    }

    case "title": {
      return [painter.heading(painter.text(entry.text))];
    }

    case "completion": {
      const text = painter.text(entry.text);

      return [
        entry.duration === undefined
          ? text
          : `${text} ${painter.mark(`(${formatDuration(entry.duration)})`)}`,
      ];
    }

    case "list": {
      return entry.items.map((item) => {
        return `${painter.mark("-")} ${painter.text(item)}`;
      });
    }

    case "table": {
      return entry.rows.length === 0 ? [] : renderTable(entry, painter);
    }

    case "tree": {
      return renderNodes(
        entry.nodes,
        {
          compact: entry.compact,
          branched: false,
          prefix: "",
        },
        painter,
      );
    }

    case "stack": {
      return [painter.mark(entry.trace)];
    }

    case "data": {
      return entry.entries.flatMap((content) => {
        return renderEntry(content, painter);
      });
    }
  }
}
