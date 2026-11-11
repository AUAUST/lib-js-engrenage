import {
  issueContracts,
  segmentForbiddenSections,
} from "#tools/github/issues/contract/constants";
import { findTypeMeaning } from "#tools/github/issues/contract/utils/findTypeMeaning";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import type { IssueContract } from "#tools/github/issues/contract/types/IssueContract";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";

const pendingPlanningPatterns = [
  /^settle\b/i,
  /^(?:create|write|file|open|plan|split|break)\b.*\b(?:sub-?issues?|tasks)\b/i,
] as const;

type ContractType = keyof typeof issueContracts;

function isContractType(type: IssueType): type is ContractType {
  return type in issueContracts;
}

function guessType(sectionNames: readonly string[]) {
  if (sectionNames.includes("Goal")) {
    return "plan" satisfies ContractType;
  }

  return sectionNames.includes("Steps")
    ? ("task" satisfies ContractType)
    : undefined;
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
  type: IssueType | undefined,
) {
  if (type === "resource" || type === "idea") {
    return;
  }

  return type !== undefined && isContractType(type)
    ? type
    : guessType(sectionNames);
}

export function checkIssueBody(
  body: string,
  type: string | undefined,
  protocol: IssueProtocol,
): IssueFinding[] {
  const parsed = parseIssueBody(body);
  const names = parsed.sections.map(({ name }) => name);

  const contractType = resolveContractType(
    names,
    findTypeMeaning(protocol, type),
  );

  if (contractType === undefined) {
    return [];
  }

  const contract: IssueContract = issueContracts[contractType];
  const typeName = protocol.types[contractType];
  const findings: IssueFinding[] = [];

  let highest: { rank: number; name: string } | undefined;

  for (const name of names) {
    if (
      contractType === "segment" &&
      (segmentForbiddenSections as readonly string[]).includes(name)
    ) {
      findings.push({
        rule: "segment-section",
        message: `A ${typeName} has no **${name}**: remove it and write it in the sub-issue that owns it.`,
      });

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
  }

  if (parsed.steps !== undefined) {
    if (!parsed.steps.numbered) {
      findings.push({
        rule: "steps-numbered",
        message: "**Steps** must be a numbered list with only `Checkpoint:` lines between items: rewrite it as numbered steps.",
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
