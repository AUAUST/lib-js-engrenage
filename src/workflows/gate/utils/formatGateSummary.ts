import type { GateFailure } from "#workflows/gate/types/GateFailure";

export function formatGateSummary(failures: readonly GateFailure[]): string {
  return `Failing steps: ${failures.map(({ step }) => step).join(", ")}`;
}
