import type { ReportData, Reporter } from "#foundation/reports/index";

interface ReportedMessage {
  readonly level: keyof Reporter;
  readonly text: string;
  readonly data: ReportData | undefined;
}

export function createTestReporter(): Reporter & {
  readonly messages: readonly ReportedMessage[];
} {
  const messages: ReportedMessage[] = [];

  function record(level: keyof Reporter) {
    return (text: string, data?: ReportData) => {
      messages.push({
        level,
        text,
        data,
      });
    };
  }

  return {
    messages,
    error: record("error"),
    warn: record("warn"),
    info: record("info"),
    log: record("log"),
  };
}
