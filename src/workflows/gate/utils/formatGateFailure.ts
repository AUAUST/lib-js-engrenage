import type { GateFailure } from "#workflows/gate/types/GateFailure";

export function formatGateFailure({ step, output }: GateFailure): string {
  return `${step}\n${output.trimEnd()}\n`;
}
