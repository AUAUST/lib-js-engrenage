import { stripCode } from "#foundation/markdown/index";
import {
  checkpointPrefix,
  housekeepingSection,
  issueContracts,
  pendingPlanningSections,
  stepsSection,
} from "#tools/github/issues/contract/constants";
import { findIssueShape } from "#tools/github/issues/contract/utils/findIssueShape";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import { parseIssueList } from "#tools/github/issues/contract/utils/parseIssueList";
import type { ContractMeaning } from "#tools/github/issues/contract/types/ContractMeaning";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

const pendingPlanningPatterns = [
  /^settle\b/i,
  /^(?:create|write|file|open|plan|split|break)\b.*\b(?:sub-?issues?|tasks)\b/i,
] as const;

const conversion = "state what they make true under **Done when**, move the code facts they verified into **Context**, and drop the procedure";

function getRank(contract: IssueContract, name: string) {
  const index = contract.sections.indexOf(name);

  if (index !== -1) {
    return index;
  }

  return contract.modelsAfter === undefined
    ? undefined
    : contract.sections.indexOf(contract.modelsAfter) + 0.5;
}

export function checkIssueBody(
  body: string,
  meaning: ContractMeaning | undefined,
  contractNames: ContractNames,
  subIssues: number,
): IssueFinding[] {
  if (meaning === undefined) {
    return [];
  }

  const parsed = parseIssueBody(body);
  const contract: IssueContract = issueContracts[meaning];
  const { forbidden = {} } = findIssueShape(meaning, parsed, subIssues);
  const typeName = contractNames.types[meaning];
  const findings: IssueFinding[] = [];

  let highest: { rank: number; name: string } | undefined;

  for (const { name, content } of parsed.sections) {
    if (name === stepsSection) {
      findings.push({
        rule: "steps",
        message: `**${stepsSection}** is no longer a section: convert it: ${conversion}.`,
      });

      continue;
    }

    const reason = forbidden[name];

    if (reason !== undefined) {
      findings.push({ rule: "forbidden-section", message: reason });

      continue;
    }

    const rank = getRank(contract, name);

    if (rank === undefined) {
      findings.push({
        rule: "unknown-section",
        message: `**${name}** is not a section of a ${typeName}: remove it, or move its content into ${contract.sections
          .map((section) => {
            return `**${section}**`;
          })
          .join(", ")}.`,
      });

      continue;
    }

    if (highest !== undefined && rank < highest.rank) {
      findings.push({
        rule: "section-order",
        message: `**${name}** comes after **${highest.name}**: order the sections of a ${typeName} as ${contract.sections.join(", ")}.`,
      });
    } else {
      highest = { rank, name };
    }

    if (!(pendingPlanningSections as readonly string[]).includes(name)) {
      continue;
    }

    const list = parseIssueList(content);

    for (const text of list.items) {
      if (pendingPlanningPatterns.some((pattern) => pattern.test(text))) {
        findings.push({
          rule: "pending-planning",
          message: `**${name}** item "${text.split("\n")[0]}" reads as pending planning: move it under **Planning**.`,
        });
      }
    }

    if (name === housekeepingSection && !list.numbered) {
      findings.push({
        rule: "housekeeping-numbered",
        message: `**${housekeepingSection}** must be a numbered list: rewrite it as numbered steps.`,
      });
    }
  }

  const checkpoints = stripCode(body)
    .split("\n")
    .some((line) => line.trimStart().startsWith(checkpointPrefix));

  if (checkpoints) {
    findings.push({
      rule: "checkpoint",
      message: `\`${checkpointPrefix}\` lines are no longer part of an issue: delete them; for the work they split, ${conversion}.`,
    });
  }

  return findings;
}
