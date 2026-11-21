import { issueContracts } from "#tools/github/issues/contract/constants";
import { hasSection } from "#tools/github/issues/contract/utils/hasSection";
import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueShape } from "#tools/github/issues/contract/types/IssueShape";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

/**
 * Returns the first shape of an issue kind whose conditions the issue meets: the
 * shape deciding both its sections and the agent it goes to.
 */
export function findIssueShape(
  meaning: ContractMeaning,
  parsed: ParsedIssueBody,
  subIssues: number,
): IssueShape {
  const { shapes }: IssueContract = issueContracts[meaning];

  const shape = shapes.find(({ when }) => {
    return (
      (when?.subIssues === undefined || when.subIssues === subIssues > 0) &&
      (when?.section === undefined || hasSection(parsed, when.section))
    );
  });

  if (shape === undefined) {
    throw new Error(`The ${meaning} contract has no shape without conditions`);
  }

  return shape;
}
