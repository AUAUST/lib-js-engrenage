import { issueContracts } from "#tools/github/issues/contract/constants";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { findIssueShape } from "#tools/github/issues/contract/utils/findIssueShape";
import { hasSection } from "#tools/github/issues/contract/utils/hasSection";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

export function checkIssueContract(
  body: string,
  meaning: ContractMeaning | undefined,
  contractNames: ContractNames,
  {
    subIssues,
    complete,
    draft = false,
  }: { subIssues: number; complete: boolean; draft?: boolean },
): IssueFinding[] {
  const findings = checkIssueBody(body, meaning, contractNames, subIssues);

  if (!complete || meaning === undefined) {
    return findings;
  }

  const contract: IssueContract = issueContracts[meaning];
  const parsed = parseIssueBody(body);
  const shape = findIssueShape(meaning, parsed, subIssues);
  const generated = new Set<string>(contract.generated);

  const required = [
    ...shape.required,
    ...(draft ? (shape.draftRequired ?? []) : []),
  ];

  for (const name of required) {
    if (draft && generated.has(name)) {
      if (subIssues === 0) {
        findings.push({
          rule: "missing-section",
          message: `**${name}** is missing: list its issues in \`subIssues\`, which publish generates it from.`,
        });
      }
    } else if (!hasSection(parsed, name)) {
      findings.push({
        rule: "missing-section",
        message: `**${name}** is missing: write it.`,
      });
    }
  }

  if (meaning === "segment" && subIssues === 0) {
    findings.push({
      rule: "sub-issues",
      message: `A ${contractNames.types.segment} needs at least one sub-issue: create them.`,
    });
  }

  return findings;
}
