import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateCoverage } from "#workflows/gate/types/GateCoverage";

/**
 * The coverage of a run whose stages ran these steps, in order, over `scope`.
 */
export function coverSteps(
  stages: readonly (readonly GateStep[])[],
  scope: GateCoverage["scope"],
): GateCoverage {
  return {
    steps: stages.flat().map(({ name }) => name),
    scope,
    reused: false,
  };
}
