import { keys } from "@auaust/toolkit/object";

import {
  debuggerBlockingOptions,
  issueContracts,
  planningSection,
  questionsSection,
} from "#tools/github/issues/contract/constants";
import { findTypeMeaning } from "#tools/github/issues/contract/utils/findTypeMeaning";
import type { IssueCommit } from "#tools/git/index";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

interface ReadinessContext {
  readonly issue: GithubIssue;
  readonly protocol: IssueProtocol;
  readonly parsed: ParsedIssueBody;
  readonly ancestors: readonly number[];
  readonly missingReferences: readonly number[];
  readonly closes: ReadonlyMap<number, IssueCommit>;
  readonly dispatch?: boolean;
  readonly ancestor?: boolean;
}

function formatChain(chain: readonly number[]) {
  return chain.length === 0
    ? "none"
    : chain.map((number) => `#${number}`).join(" › ");
}

function hasSection(parsed: ParsedIssueBody, name: string) {
  return parsed.sections.some((section) => section.name === name);
}

export function checkIssueReadiness(
  {
    issue,
    protocol,
    parsed,
    ancestors,
    missingReferences,
    closes,
    dispatch = false,
    ancestor = false,
  }: ReadinessContext,
  audience: IssueAudience,
): IssueFinding[] {
  const findings: IssueFinding[] = [];

  const closedBy = closes.get(issue.number);

  if (issue.state !== "open") {
    findings.push({ rule: "state", message: `#${issue.number} is closed.` });
  } else if (closedBy !== undefined) {
    findings.push({
      rule: "state",
      message: `#${issue.number} is closed by local commit ${closedBy.hash}.`,
    });
  }

  const { types, fields, options } = protocol;
  const type = findTypeMeaning(protocol, issue.type);
  const blockersField = fields.blockers;
  const openQuestionsOption = options.openQuestions;

  const contract = type !== undefined && type in issueContracts
    ? issueContracts[type as keyof typeof issueContracts]
    : undefined;

  if (audience === "debugger" && !ancestor) {
    if (type !== "problem") {
      findings.push({
        rule: "type",
        message: `#${issue.number} is ${issue.type === undefined ? "untyped" : `a ${issue.type}`}: a debugger takes a ${types.problem}.`,
      });
    }
  } else if (contract === undefined) {
    findings.push({
      rule: "type",
      message: `#${issue.number} is ${issue.type === undefined ? "untyped" : `a ${issue.type}`}: expected a ${keys(
        issueContracts,
      )
        .map((meaning) => types[meaning])
        .join(", ")}.`,
    });
  }

  if (dispatch && !ancestor) {
    if (audience === "worker" && type !== "task" && type !== "problem") {
      findings.push({
        rule: "dispatch-type",
        message: `#${issue.number} is a ${issue.type}: a worker takes a ${types.task} or ${types.problem} leaf.`,
      });
    }

    for (const { number, state } of issue.subIssues) {
      if (state === "open" && !closes.has(number)) {
        findings.push({
          rule: "sub-issues",
          message: `#${issue.number} has open sub-issue #${number}: finish it first.`,
        });
      }
    }
  }

  if (audience === "worker" || ancestor) {
    for (const name of contract?.required ?? []) {
      if (!hasSection(parsed, name)) {
        findings.push({
          rule: "missing-section",
          message: `**${name}** is missing: write it.`,
        });
      }
    }

    if (type === "segment" && issue.subIssues.length === 0) {
      findings.push({
        rule: "sub-issues",
        message: `A ${types.segment} needs at least one sub-issue: create them.`,
      });
    }
  }

  const openSections = [planningSection, questionsSection].filter((name) => {
    return hasSection(parsed, name);
  });

  for (const name of openSections) {
    if (name === planningSection || audience === "worker") {
      findings.push({
        rule: "open-section",
        message: `**${name}** is open: the planner or the user settles it first.`,
      });
    }
  }

  if (audience === "worker" || dispatch) {
    const asksQuestions = issue.blockers.includes(openQuestionsOption);

    if (openSections.length > 0 && !asksQuestions) {
      findings.push({
        rule: "stale-field",
        message: `${blockersField} lacks \`${openQuestionsOption}\` although ${openSections
          .map((name) => {
            return `**${name}**`;
          })
          .join(" and ")} is open: set the field.`,
      });
    } else if (openSections.length === 0 && asksQuestions) {
      findings.push({
        rule: "stale-field",
        message: `${blockersField} has \`${openQuestionsOption}\` although no **${planningSection}** or **${questionsSection}** is open: clear the field.`,
      });
    }
  }

  for (const option of issue.blockers) {
    if (
      (audience === "worker" &&
        (option !== openQuestionsOption ||
          (dispatch &&
            option === openQuestionsOption &&
            openSections.length === 0))) ||
      (audience === "debugger" &&
        debuggerBlockingOptions.some((blocking) => {
          return options[blocking] === option;
        }))
    ) {
      findings.push({
        rule: "blockers",
        message: `${blockersField} has \`${option}\`: clear it first.`,
      });
    }
  }

  if (audience === "worker" || dispatch) {
    for (const { number, state } of issue.blockedBy) {
      if (state === "open" && !closes.has(number)) {
        findings.push({
          rule: "blocked-by",
          message: `Blocked by the open #${number}: settle it first.`,
        });
      }
    }

    if (contract?.hasHeader === true) {
      const actual = parsed.header?.ancestors ?? [];

      if (formatChain(actual) !== formatChain(ancestors)) {
        findings.push({
          rule: "header-chain",
          message: `The header line names ${formatChain(actual)} but the ancestors from the nearest plan are ${formatChain(ancestors)}: rewrite it.`,
        });
      }
    }

    if (type === "plan") {
      const expected = issue.subIssues.map(({ number }) => number);

      if (formatChain(parsed.roadmap) !== formatChain(expected)) {
        findings.push({
          rule: "roadmap-order",
          message: `**Roadmap** references ${formatChain(parsed.roadmap)} but the sub-issues are ${formatChain(expected)}: reorder it.`,
        });
      }
    }

    for (const number of missingReferences) {
      findings.push({
        rule: "missing-reference",
        message: `#${number} does not exist: fix the reference.`,
      });
    }
  }

  return findings;
}
