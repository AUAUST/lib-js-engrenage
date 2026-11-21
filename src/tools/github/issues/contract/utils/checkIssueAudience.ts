import { findIssueShape } from "#tools/github/issues/contract/utils/findIssueShape";
import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

// @debt A debugger briefed on a Task leaf gets this finding beside readiness's `type` finding, two messages for one misroute.
export function checkIssueAudience(
  meaning: ContractMeaning | undefined,
  parsed: ParsedIssueBody,
  subIssues: number,
  audience: IssueAudience,
  contractNames: ContractNames,
): IssueFinding[] {
  if (meaning === undefined) {
    return [];
  }

  const shape = findIssueShape(meaning, parsed, subIssues);

  if (
    shape.audience === audience ||
    (shape.audience !== "worker" && shape.audience !== "debugger")
  ) {
    return [];
  }

  return [
    {
      rule: "audience",
      message: `A ${contractNames.types[meaning]} ${shape.summary} goes to a ${shape.audience}: dispatch one.`,
    },
  ];
}
