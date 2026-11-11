import type { IssueTreeCheck } from "#tools/github/issues/contract/types/IssueTreeCheck";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

function formatState({ state, closedBy }: WalkedIssue) {
  return closedBy === undefined
    ? state
    : `closed by local commit ${closedBy.hash}`;
}

function formatIssue(issue: WalkedIssue): readonly string[] {
  const indent = "  ".repeat(issue.depth);

  const details = [
    ...(issue.blockers.length > 0
      ? [`Blockers: ${issue.blockers.join(", ")}`]
      : []),
    ...issue.findings.map(({ rule, message }) => `[${rule}] ${message}`),
    ...(issue.openSections.length > 0
      ? [`Open: ${issue.openSections.map((name) => `**${name}**`).join(", ")}`]
      : []),
    ...issue.towards.map(({ hash, subject }) => `Towards: ${hash} ${subject}`),
    ...issue.closes.map(({ hash, subject }) => `Closes: ${hash} ${subject}`),
  ];

  return [
    `${indent}#${issue.number} ${issue.type ?? "untyped"}: ${formatState(issue)}`,
    ...details.map((line) => `${indent}  ${line}`),
  ];
}

export function formatIssueTreeCheck({
  issues,
  next,
}: IssueTreeCheck): readonly string[] {
  return [
    ...issues.flatMap(formatIssue),
    next === undefined
      ? "Next: none, no open issue has its sub-issues closed and no finding"
      : `Next: #${next}`,
  ];
}
