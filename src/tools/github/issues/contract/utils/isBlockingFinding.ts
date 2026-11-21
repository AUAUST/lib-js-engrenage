import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

export function isBlockingFinding({ severity }: IssueFinding) {
  return severity !== "warning";
}
