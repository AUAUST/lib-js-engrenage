import type { ReportData, Reporter } from "#nexus/reports/index";

interface ReportedMessage {
  readonly level: keyof Reporter;
  readonly text: string;
  readonly data: ReportData | undefined;
}

export function createTestReporter(): Reporter & {
  readonly messages: readonly ReportedMessage[];
  readonly warnings: readonly string[];
} {
  const messages: ReportedMessage[] = [];
  const warnings: string[] = [];

  function record(level: keyof Reporter) {
    return (text: string, data?: ReportData) => {
      messages.push({
        level,
        text,
        data,
      });

      if (level === "warn") {
        warnings.push(text);
      }
    };
  }

  return {
    messages,
    warnings,
    error: record("error"),
    warn: record("warn"),
    info: record("info"),
    log: record("log"),
    debug: record("debug"),
  };
}
