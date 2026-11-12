import { renderReference } from "#tools/github/issues/contract/utils/renderReference";
import type { IssueTreeCheck } from "#tools/github/issues/contract/types/IssueTreeCheck";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

function formatState({ state, closedBy }: WalkedIssue) {
  return closedBy === undefined
    ? state
    : `closed by local commit ${closedBy.hash}`;
}

function formatIssue(
  issue: WalkedIssue,
  repository: string,
): readonly string[] {
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
    `${indent}${renderReference(issue, repository)} ${issue.type ?? "untyped"}: ${formatState(issue)}`,
    ...details.map((line) => `${indent}  ${line}`),
  ];
}

// @debt Rebuilds tree order from `depth` after `checkIssueTree` flattened the tree to walk order; the check could return both orders from the tree it holds.
function toTreeOrder(issues: readonly WalkedIssue[]): readonly WalkedIssue[] {
  const subtrees: { depth: number; issues: readonly WalkedIssue[] }[] = [];

  for (const issue of issues) {
    const start = subtrees.findIndex(({ depth }) => depth > issue.depth);

    const children = start === -1 ? [] : subtrees.splice(start);

    subtrees.push({
      depth: issue.depth,
      issues: [issue, ...children.flatMap((child) => child.issues)],
    });
  }

  return subtrees.flatMap((subtree) => subtree.issues);
}

export function formatIssueTreeCheck({
  repository,
  issues,
  ready,
}: IssueTreeCheck): readonly string[] {
  const [next] = ready;

  return [
    ...toTreeOrder(issues).flatMap((issue) => formatIssue(issue, repository)),
    ...(next === undefined
      ? // @debt The none message omits the in-turn condition: an open issue with closed sub-issues and no finding can still be out of turn.
        ["Next: none, no open issue has its sub-issues closed and no finding"]
      : [
          `Ready: ${ready
            .map((issue) => {
              return renderReference(issue, repository);
            })
            .join(", ")}`,
          `Next: ${renderReference(next, repository)}`,
        ]),
  ];
}
