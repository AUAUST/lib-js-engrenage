import { keys } from "@auaust/toolkit/object";

import {
  debuggerBlockingOptions,
  issueContracts,
  planningSection,
} from "#tools/github/issues/contract/constants";
import { checkBlockersField } from "#tools/github/issues/contract/utils/checkBlockersField";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import { findTypeMeaning } from "#tools/github/issues/contract/utils/findTypeMeaning";
import { isSameIssue } from "#tools/github/issues/contract/utils/isSameIssue";
import { listOpenSections } from "#tools/github/issues/contract/utils/listOpenSections";
import { renderReference } from "#tools/github/issues/contract/utils/renderReference";
import type { IssueCommit } from "#tools/git/index";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

interface ReadinessContext {
  readonly issue: GithubIssue;
  readonly repository: string;
  readonly localRepository: string;
  readonly protocol: IssueProtocol;
  readonly parsed: ParsedIssueBody;
  readonly ancestors: readonly IssueLocation[];
  readonly missingReferences: readonly number[];
  readonly closes: ReadonlyMap<number, IssueCommit>;
  readonly dispatch?: boolean;
  readonly ancestor?: boolean;
}

function formatChain(chain: readonly IssueLocation[], repository: string) {
  return chain.length === 0
    ? "none"
    : chain
        .map((location) => renderReference(location, repository))
        .join(" › ");
}

function isSameChain(
  left: readonly IssueLocation[],
  right: readonly IssueLocation[],
) {
  return (
    left.length === right.length &&
    left.every((location, index) => {
      const other = right[index];

      return other !== undefined && isSameIssue(location, other);
    })
  );
}

function resolveWritten(
  written: readonly {
    readonly repository: string | undefined;
    readonly number: number;
  }[],
  repository: string,
): readonly IssueLocation[] {
  return written.map(({ repository: owner, number }) => {
    return { repository: owner ?? repository, number };
  });
}

function hasSection(parsed: ParsedIssueBody, name: string) {
  return parsed.sections.some((section) => section.name === name);
}

export function checkIssueReadiness(
  {
    issue,
    repository,
    localRepository,
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

  function findClosure(location: IssueLocation) {
    return location.repository.toLowerCase() === localRepository.toLowerCase()
      ? closes.get(location.number)
      : undefined;
  }

  const self = renderReference(
    { repository, number: issue.number },
    localRepository,
  );

  const closedBy = findClosure({ repository, number: issue.number });

  if (issue.state !== "open") {
    findings.push({ rule: "state", message: `${self} is closed.` });
  } else if (closedBy !== undefined) {
    findings.push({
      rule: "state",
      message: `${self} is closed by local commit ${closedBy.hash}.`,
    });
  }

  const { types, fields, options } = protocol;
  const type = findTypeMeaning(protocol, issue.type);
  const contractMeaning = findContractMeaning(protocol, issue.type);
  const blockersField = fields.blockers;
  const questionsOption = options.questions;

  const contract = contractMeaning === undefined
    ? undefined
    : issueContracts[contractMeaning];

  if (audience === "debugger" && !ancestor) {
    if (type !== "problem") {
      findings.push({
        rule: "type",
        message: `${self} is ${issue.type === undefined ? "untyped" : `a ${issue.type}`}: a debugger takes a ${types.problem}.`,
      });
    }
  } else if (contract === undefined) {
    findings.push({
      rule: "type",
      message: `${self} is ${issue.type === undefined ? "untyped" : `a ${issue.type}`}: expected a ${keys(
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
        message: `${self} is a ${issue.type}: a worker takes a ${types.task} or ${types.problem} leaf.`,
      });
    }

    for (const sub of issue.subIssues) {
      if (sub.state === "open" && findClosure(sub) === undefined) {
        findings.push({
          rule: "sub-issues",
          message: `${self} has open sub-issue ${renderReference(sub, localRepository)}: finish it first.`,
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

  const openSections = listOpenSections(parsed);

  for (const name of openSections) {
    if (name === planningSection || audience === "worker") {
      findings.push({
        rule: "open-section",
        message: `**${name}** is open: the planner or the user settles it first.`,
      });
    }
  }

  if (audience === "worker" || dispatch) {
    findings.push(
      ...checkBlockersField(openSections, issue.blockers, protocol),
    );
  }

  for (const option of issue.blockers) {
    if (
      (audience === "worker" &&
        (option !== questionsOption ||
          (dispatch &&
            option === questionsOption &&
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
    for (const blocker of issue.blockedBy) {
      if (blocker.state === "open" && findClosure(blocker) === undefined) {
        findings.push({
          rule: "blocked-by",
          message: `Blocked by the open ${renderReference(blocker, localRepository)}: settle it first.`,
        });
      }
    }

    if (contract?.hasHeader === true) {
      const actual = resolveWritten(parsed.header?.ancestors ?? [], repository);

      if (!isSameChain(actual, ancestors)) {
        findings.push({
          rule: "header-chain",
          message: `The header line names ${formatChain(actual, repository)} but the ancestors from the nearest plan are ${formatChain(ancestors, repository)}: rewrite it.`,
        });
      }
    }

    if (type === "plan") {
      const listed = resolveWritten(parsed.roadmap, repository);

      if (!isSameChain(listed, issue.subIssues)) {
        findings.push({
          rule: "roadmap-order",
          message: `**Roadmap** references ${formatChain(listed, repository)} but the sub-issues are ${formatChain(issue.subIssues, repository)}: reorder it.`,
        });
      }
    }

    for (const number of missingReferences) {
      findings.push({
        rule: "missing-reference",
        message: `${renderReference({ repository, number }, localRepository)} does not exist: fix the reference.`,
      });
    }
  }

  return findings;
}
