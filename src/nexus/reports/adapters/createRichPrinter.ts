import { styleText } from "node:util";

import { isString } from "@auaust/toolkit";

import { readReportText } from "#nexus/reports/utils/readReportText";
import { renderEntry } from "#nexus/reports/utils/renderEntry";
import type { Printer } from "#nexus/reports/ports/Printer";
import type { EntryPainter } from "#nexus/reports/types/EntryPainter";
import type { ReportEntry } from "#nexus/reports/types/ReportEntry";
import type { ReportKind } from "#nexus/reports/types/ReportKind";
import type { ReportText } from "#nexus/reports/types/ReportText";
import type { SpanStyle } from "#nexus/reports/types/SpanStyle";

type TextFormat = Parameters<typeof styleText>[0];

const spanFormats = {
  success: "green",
  failure: "red",
  warning: "yellow",
  path: "cyan",
  identifier: "magenta",
  command: "blueBright",
  emphasis: "bold",
  muted: "dim",
} as const satisfies Record<SpanStyle, TextFormat>;

const leads = {
  error: { glyph: "✖", format: "red" },
  warn: { glyph: "⚠", format: "yellow" },
} as const satisfies Partial<
  Record<
    ReportKind,
    {
      glyph: string;
      format: TextFormat;
    }
  >
>;

function isFailure(text: ReportText): boolean {
  return (
    !isString(text) &&
    text.some((span) => {
      return !isString(span) && span.style === "failure";
    })
  );
}

function createPainter(
  stream: NodeJS.WriteStream,
  dimmed: boolean,
): EntryPainter {
  function style(format: TextFormat, text: string): string {
    return styleText(format, text, { stream });
  }

  function text(reported: ReportText): string {
    if (dimmed) {
      return style("dim", readReportText(reported));
    }

    return isString(reported)
      ? reported
      : reported
          .map((span) => {
            return isString(span)
              ? span
              : style(spanFormats[span.style], span.text);
          })
          .join("");
  }

  function heading(line: string): string {
    return style("bold", line);
  }

  function mark(line: string): string {
    return style("dim", line);
  }

  return {
    text,
    heading,
    mark,
  };
}

function leadLines(
  lines: readonly string[],
  lead: { glyph: string; format: TextFormat },
  stream: NodeJS.WriteStream,
): string[] {
  const [first = "", ...rest] = lines;

  return [
    `${styleText(lead.format, lead.glyph, { stream })} ${first}`,
    ...rest,
  ];
}

function decorate(
  entry: ReportEntry,
  kind: ReportKind,
  lines: readonly string[],
  stream: NodeJS.WriteStream,
): readonly string[] {
  if (entry.kind === "completion") {
    return leadLines(
      lines,
      isFailure(entry.text) ? leads.error : { glyph: "✔", format: "green" },
      stream,
    );
  }

  if (entry.kind === "line" && (kind === "error" || kind === "warn")) {
    return leadLines(lines, leads[kind], stream);
  }

  return lines;
}

/**
 * Creates a printer of colored, spaced text for a person: semantic styles as
 * colors through `util.styleText` on the stream each entry goes to, errors and
 * warnings led by a glyph, debug reports dimmed and a blank line around each
 * entry but a line or a stack; results and completion lines go to stdout, every
 * other report to stderr.
 */
export function createRichPrinter(): Printer {
  let printed: "nothing" | "line" | "block" = "nothing";

  /** @observing */
  function print(entry: ReportEntry, kind: ReportKind) {
    const stream = kind === "log" || kind === "complete"
      ? process.stdout
      : process.stderr;

    const painter = createPainter(stream, kind === "debug");

    const lines = decorate(entry, kind, renderEntry(entry, painter), stream);

    if (lines.length === 0) {
      return;
    }

    const block = entry.kind !== "line" && entry.kind !== "stack";

    const spaced = printed === "block" || (printed === "line" && block);

    stream.write(`${spaced ? "\n" : ""}${lines.join("\n")}\n`);

    printed = block ? "block" : "line";
  }

  return { print };
}
