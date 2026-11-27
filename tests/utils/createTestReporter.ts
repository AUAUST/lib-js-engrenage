import { mapValues } from "@auaust/toolkit/object";

import {
  createReporter,
  readReportText,
  renderDenseEntry,
  type Printer,
  type ReportData,
  type ReportEntry,
  type Reporter,
  type ReportKind,
} from "#nexus/reports/index";
import { nexusScenarios, type ScenarioPrinters } from "#nexus/scenarios/index";

interface ReportedMessage {
  readonly level: ReportKind;
  readonly text: string;
  readonly data: ReportData | undefined;
}

function readData(entry: ReportEntry): ReportData | undefined {
  if (entry.kind !== "line") {
    return;
  }

  const { source, fix } = entry;

  if (source === undefined && fix === undefined) {
    return;
  }

  return {
    ...(source !== undefined && { source }),
    ...(fix !== undefined && { fix: readReportText(fix) }),
  };
}

export function createTestReporter(): Reporter & {
  readonly printer: Printer;
  readonly scenarios: ScenarioPrinters;
  readonly entries: readonly ReportEntry[];
  readonly messages: readonly ReportedMessage[];
  readonly warnings: readonly string[];
} {
  const entries: ReportEntry[] = [];
  const messages: ReportedMessage[] = [];
  const warnings: string[] = [];

  const printer: Printer = {
    print(entry, level) {
      entries.push(entry);

      const texts = entry.kind === "line"
        ? [readReportText(entry.text)]
        : renderDenseEntry(entry);

      for (const text of texts) {
        messages.push({
          level,
          text,
          data: readData(entry),
        });

        if (level === "warn") {
          warnings.push(text);
        }
      }
    },
  };

  return {
    ...createReporter(printer),
    printer,
    scenarios: mapValues(nexusScenarios, () => {
      return () => printer;
    }),
    entries,
    messages,
    warnings,
  };
}
