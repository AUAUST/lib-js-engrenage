import { styled, type ReportText } from "#nexus/reports/index";
import type { GateFailure } from "#workflows/gate/types/GateFailure";

export function formatGateSummary(
  failures: readonly GateFailure[],
): ReportText {
  return [
    styled("failure", "Failing steps:"),
    ` ${failures.map(({ step }) => step).join(", ")}`,
  ];
}
