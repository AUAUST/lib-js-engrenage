import { renderReference } from "#tools/github/issues/contract/utils/renderReference";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { IssueTreeCheck } from "#tools/github/issues/contract/types/IssueTreeCheck";
import type { WalkedIssue } from "#tools/github/issues/contract/types/WalkedIssue";

function formatState({ state, closedBy }: WalkedIssue) {
  return closedBy === undefined
    ? state
    : `closed by unpushed commit ${closedBy.hash}`;
}

interface IssueNode {
  readonly issue: WalkedIssue;
  readonly children: readonly IssueNode[];
}

function isClosed({ state, closedBy }: WalkedIssue) {
  return state === "closed" || closedBy !== undefined;
}

function listDescendants({ children }: IssueNode): readonly WalkedIssue[] {
  return children.flatMap((child) => {
    return [child.issue, ...listDescendants(child)];
  });
}

function formatClosedDescendant(issue: WalkedIssue, repository: string) {
  const reference = renderReference(issue, repository);

  return issue.closedBy === undefined
    ? reference
    : `${reference} (unpushed ${issue.closedBy.hash})`;
}

function isReady(issue: WalkedIssue, ready: readonly IssueLocation[]) {
  return ready.some(({ repository, number }) => {
    return repository === issue.repository && number === issue.number;
  });
}

function formatIssue(
  node: IssueNode,
  repository: string,
  ready: readonly IssueLocation[],
): readonly string[] {
  const { issue } = node;

  const indent = "  ".repeat(issue.depth);

  const descendants = isClosed(issue) ? listDescendants(node) : [];

  const collapsed = (
    isClosed(issue) &&
    !descendants.some((descendant) => {
      return isReady(descendant, ready);
    })
  );

  const closed = collapsed ? descendants.filter(isClosed) : [];

  const open = descendants.filter((descendant) => !isClosed(descendant));

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
    ...(open.length > 0
      ? [
          `Warning: closed with open sub-issues ${open
            .map((descendant) => renderReference(descendant, repository))
            .join(", ")}`,
        ]
      : []),
    ...(closed.length > 0
      ? [
          `Closed sub-issues: ${closed.length} (${closed
            .map((descendant) => formatClosedDescendant(descendant, repository))
            .join(", ")})`,
        ]
      : []),
  ];

  return [
    `${indent}${renderReference(issue, repository)} ${issue.type ?? "untyped"}: ${formatState(issue)}`,
    ...details.map((line) => `${indent}  ${line}`),
    ...(collapsed
      ? []
      : node.children.flatMap((child) => {
          return formatIssue(child, repository, ready);
        })),
  ];
}

// @debt Rebuilds the tree from `depth` after `checkIssueTree` flattened it to walk order; the check could return the tree it holds.
function toTree(issues: readonly WalkedIssue[]): readonly IssueNode[] {
  const subtrees: IssueNode[] = [];

  for (const issue of issues) {
    const start = subtrees.findIndex(({ issue: { depth } }) => {
      return depth > issue.depth;
    });

    const children = start === -1 ? [] : subtrees.splice(start);

    subtrees.push({ issue, children });
  }

  return subtrees;
}

export function formatIssueTreeCheck({
  repository,
  checkouts,
  issues,
  ready,
  finished,
}: IssueTreeCheck): readonly string[] {
  const [next] = ready;

  return [
    ...(checkouts.length === 0
      ? ["Checkouts: none, no local commit read"]
      : checkouts.map(({ repository: checkout, ref }) => {
          return `Checkout: ${checkout} at ${ref}`;
        })),
    ...toTree(issues).flatMap((node) => formatIssue(node, repository, ready)),
    ...(next === undefined
      ? [
          finished
            ? "Next: none, walk finished"
            : "Next: none, walk stuck: no open issue in turn within the plan depth has its sub-issues closed and no finding",
        ]
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
