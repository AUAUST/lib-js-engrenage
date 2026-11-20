import { findIssueAudience } from "#tools/github/issues/contract/utils/findIssueAudience";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

export function checkIssueAudience(
  meaning: IssueType | undefined,
  parsed: ParsedIssueBody,
  audience: IssueAudience,
  contractNames: ContractNames,
): IssueFinding[] {
  if (
    meaning !== "problem" ||
    findIssueAudience(meaning, parsed) === audience
  ) {
    return [];
  }

  const typeName = contractNames.types.problem;

  return [
    {
      rule: "audience",
      message: audience === "worker"
        ? `A ${typeName} without **Steps** goes to a debugger: dispatch one, or write **Steps** once the cause is clear.`
        : `A ${typeName} with **Steps** goes to a worker: dispatch one.`,
    },
  ];
}
