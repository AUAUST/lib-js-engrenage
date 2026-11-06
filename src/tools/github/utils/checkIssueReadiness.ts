import {
  blockersField,
  debuggerBlockingOptions,
  issueContracts,
  openQuestionsOption,
  planningSection,
  questionsSection,
} from "#tools/github/constants";
import type { GithubIssue } from "#tools/github/types/GithubIssue";
import type { IssueAudience } from "#tools/github/types/IssueAudience";
import type { IssueFinding } from "#tools/github/types/IssueFinding";
import type { ParsedIssueBody } from "#tools/github/types/ParsedIssueBody";

interface ReadinessContext {
  readonly issue: GithubIssue;
  readonly parsed: ParsedIssueBody;
  readonly ancestors: readonly number[];
  readonly missingReferences: readonly number[];
}

function formatChain(chain: readonly number[]) {
  return chain.length === 0
    ? "none"
    : chain.map((number) => `#${number}`).join(" › ");
}

function hasSection(parsed: ParsedIssueBody, name: string) {
  return parsed.sections.some((section) => section.name === name);
}

function checkDebuggerReadiness({ issue, parsed }: ReadinessContext) {
  const findings: IssueFinding[] = [];

  if (issue.state !== "open") {
    findings.push({ rule: "state", message: `#${issue.number} is closed.` });
  }

  if (issue.type !== "Problem") {
    findings.push({
      rule: "type",
      message: `#${issue.number} is ${issue.type === undefined ? "untyped" : `a ${issue.type}`}: a debugger takes a Problem.`,
    });
  }

  if (hasSection(parsed, planningSection)) {
    findings.push({
      rule: "open-section",
      message: `**${planningSection}** is open: the planner settles it first.`,
    });
  }

  for (const option of debuggerBlockingOptions) {
    if (issue.blockers.includes(option)) {
      findings.push({
        rule: "blockers",
        message: `${blockersField} has \`${option}\`: clear it first.`,
      });
    }
  }

  return findings;
}

export function checkIssueReadiness(
  context: ReadinessContext,
  audience: IssueAudience,
): IssueFinding[] {
  if (audience === "debugger") {
    return checkDebuggerReadiness(context);
  }

  const { issue, parsed, ancestors, missingReferences } = context;
  const findings: IssueFinding[] = [];

  if (issue.state !== "open") {
    findings.push({ rule: "state", message: `#${issue.number} is closed.` });
  }

  const contract =
    issue.type !== undefined && issue.type in issueContracts
      ? issueContracts[issue.type as keyof typeof issueContracts]
      : undefined;

  if (contract === undefined) {
    findings.push({
      rule: "type",
      message: `#${issue.number} is ${issue.type === undefined ? "untyped" : `a ${issue.type}`}: only a Plan, Segment, Task or Problem is dispatched.`,
    });

    return findings;
  }

  for (const name of contract.required) {
    if (!hasSection(parsed, name)) {
      findings.push({
        rule: "missing-section",
        message: `**${name}** is missing: write it.`,
      });
    }
  }

  if (issue.type === "Segment" && issue.subIssues.length === 0) {
    findings.push({
      rule: "sub-issues",
      message: "A Segment needs at least one sub-issue: create them.",
    });
  }

  const openSections = [planningSection, questionsSection].filter((name) => {
    return hasSection(parsed, name);
  });

  for (const name of openSections) {
    findings.push({
      rule: "open-section",
      message: `**${name}** is open: the planner or the user settles it first.`,
    });
  }

  const asksQuestions = issue.blockers.includes(openQuestionsOption);

  if (openSections.length > 0 && !asksQuestions) {
    findings.push({
      rule: "stale-field",
      message: `${blockersField} lacks \`${openQuestionsOption}\` although ${openSections.map((name) => `**${name}**`).join(" and ")} is open: set the field.`,
    });
  } else if (openSections.length === 0 && asksQuestions) {
    findings.push({
      rule: "stale-field",
      message: `${blockersField} has \`${openQuestionsOption}\` although no **${planningSection}** or **${questionsSection}** is open: clear the field.`,
    });
  }

  for (const option of issue.blockers) {
    if (option !== openQuestionsOption) {
      findings.push({
        rule: "blockers",
        message: `${blockersField} has \`${option}\`: clear it first.`,
      });
    }
  }

  for (const { number, state } of issue.blockedBy) {
    if (state === "open") {
      findings.push({
        rule: "blocked-by",
        message: `Blocked by the open #${number}: settle it first.`,
      });
    }
  }

  if (contract.hasHeader) {
    const actual = parsed.header?.ancestors ?? [];

    if (formatChain(actual) !== formatChain(ancestors)) {
      findings.push({
        rule: "header-chain",
        message: `The header line names ${formatChain(actual)} but the ancestors from the nearest plan are ${formatChain(ancestors)}: rewrite it.`,
      });
    }
  }

  if (issue.type === "Plan") {
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

  return findings;
}
