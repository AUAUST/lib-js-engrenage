import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

export function formatGateEntry({
  step,
  output,
}: GateFailure | GateWarning): string {
  return `${step}\n${output.trimEnd()}\n`;
}
