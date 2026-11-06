import {
  issueContracts,
  segmentForbiddenSections,
} from "#tools/github/constants";
import { parseIssueBody } from "#tools/github/utils/parseIssueBody";
import type { IssueContract } from "#tools/github/types/IssueContract";
import type { IssueFinding } from "#tools/github/types/IssueFinding";
import type { IssueType } from "#tools/github/types/IssueType";

const pendingPlanningPatterns = [
  /^settle\b/i,
  /^(?:create|write|file|open|plan|split|break)\b.*\b(?:sub-?issues?|tasks)\b/i,
] as const;

function guessType(sectionNames: readonly string[]) {
  if (sectionNames.includes("Goal")) {
    return "Plan" satisfies IssueType;
  }

  return sectionNames.includes("Steps")
    ? ("Task" satisfies IssueType)
    : ("Segment" satisfies IssueType);
}

function getRank(contract: IssueContract, name: string) {
  const index = contract.sections.indexOf(name);

  if (index !== -1) {
    return index;
  }

  return contract.modelsAfter === undefined
    ? undefined
    : contract.sections.indexOf(contract.modelsAfter) + 0.5;
}

function resolveContractType(
  sectionNames: readonly string[],
  type: string | undefined,
): IssueType {
  return type !== undefined && type in issueContracts
    ? (type as keyof typeof issueContracts)
    : type === "Resource" || type === "Idea"
      ? type
      : guessType(sectionNames);
}

export function checkIssueBody(
  body: string,
  type: string | undefined,
): IssueFinding[] {
  const parsed = parseIssueBody(body);
  const names = parsed.sections.map(({ name }) => name);
  const contractType = resolveContractType(names, type);

  if (contractType === "Resource" || contractType === "Idea") {
    return [];
  }

  const contract: IssueContract = issueContracts[contractType];
  const findings: IssueFinding[] = [];

  let highest: { rank: number; name: string } | undefined;

  for (const name of names) {
    if (
      contractType === "Segment" &&
      (segmentForbiddenSections as readonly string[]).includes(name)
    ) {
      findings.push({
        rule: "segment-section",
        message: `A Segment has no **${name}**: remove it and write it in the sub-issue that owns it.`,
      });

      continue;
    }

    const rank = getRank(contract, name);

    if (rank === undefined) {
      findings.push({
        rule: "unknown-section",
        message: `**${name}** is not a section of a ${contractType}: remove it, or move its content into ${contract.sections.map((section) => `**${section}**`).join(", ")}.`,
      });

      continue;
    }

    if (highest !== undefined && rank < highest.rank) {
      findings.push({
        rule: "section-order",
        message: `**${name}** comes after **${highest.name}**: order the sections of a ${contractType} as ${contract.sections.join(", ")}.`,
      });
    } else {
      highest = { rank, name };
    }
  }

  if (parsed.steps !== undefined) {
    if (!parsed.steps.numbered) {
      findings.push({
        rule: "steps-numbered",
        message:
          "**Steps** must be a numbered list with only `Checkpoint:` lines between items: rewrite it as numbered steps.",
      });
    }

    for (const { text } of parsed.steps.items) {
      if (pendingPlanningPatterns.some((pattern) => pattern.test(text))) {
        findings.push({
          rule: "pending-planning",
          message: `**Steps** item "${text.split("\n")[0]}" reads as pending planning: move it under **Planning**.`,
        });
      }
    }
  }

  return findings;
}
