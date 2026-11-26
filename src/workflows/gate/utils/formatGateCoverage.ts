import type { GateCoverage } from "#workflows/gate/types/GateCoverage";

function formatScope(scope: GateCoverage["scope"]): string {
  if (scope === "project") {
    return "the whole project";
  }

  return scope === 1 ? "1 changed file" : `${scope} changed files`;
}

export function formatGateCoverage({
  steps,
  scope,
  reused,
}: GateCoverage): string {
  if (scope === 0) {
    return "Gate checked nothing: no change to check.";
  }

  if (reused) {
    return `Gate passed: an earlier run passed the same ${formatScope(scope)}.`;
  }

  if (steps.length === 0) {
    return `Gate checked nothing: no step applies to ${formatScope(scope)}.`;
  }

  return `Gate passed: ${steps.join(", ")} on ${formatScope(scope)}.`;
}
