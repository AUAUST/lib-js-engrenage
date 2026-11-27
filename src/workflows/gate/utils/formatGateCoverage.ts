import { styled, type ReportText } from "#nexus/reports/index";
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
}: GateCoverage): ReportText {
  if (scope === 0) {
    return "Gate checked nothing: no change to check";
  }

  if (reused) {
    return [
      styled("success", "Gate passed:"),
      ` an earlier run passed the same ${formatScope(scope)}`,
    ];
  }

  if (steps.length === 0) {
    return `Gate checked nothing: no step applies to ${formatScope(scope)}`;
  }

  return [
    styled("success", "Gate passed:"),
    ` ${steps.join(", ")} on ${formatScope(scope)}`,
  ];
}
