import { entries } from "@auaust/toolkit/object";

import type { IssueCheck } from "#tools/github/issues/contract/types/IssueCheck";
import type { RelatedIssue } from "#tools/github/issues/contract/types/RelatedIssue";

interface RelatedLabels {
  readonly open: string;
  readonly local: string;
  readonly closed: string;
}

function formatRelated(
  number: number,
  related: readonly RelatedIssue[],
  labels: RelatedLabels,
) {
  const groups: Record<keyof RelatedLabels, string[]> = {
    open: [],
    local: [],
    closed: [],
  };

  for (const { number: other, state, closedBy } of related) {
    if (closedBy !== undefined) {
      groups.local.push(`#${other} (${closedBy.hash})`);
    } else {
      groups[state].push(`#${other}`);
    }
  }

  return entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(
      ([group, items]) => `#${number} ${labels[group]}: ${items.join(", ")}`,
    );
}

export function formatIssueCheck(
  number: number,
  { findings, subIssues, blockedBy, towards }: IssueCheck,
): readonly string[] {
  const context = [
    ...formatRelated(number, subIssues, {
      open: "has open sub-issues to walk first",
      local: "has sub-issues closed by local commits",
      closed: "has sub-issues closed on GitHub",
    }),
    ...formatRelated(number, blockedBy, {
      open: "is blocked by the open",
      local: "was blocked by issues closed by local commits",
      closed: "was blocked by issues closed on GitHub",
    }),
    ...towards.map(({ hash, subject }) => {
      return `#${number} has a commit towards it: ${hash} ${subject}`;
    }),
  ];

  const subject = context.length === 0 ? `#${number}` : `#${number} itself:`;

  return [
    ...context,
    ...(findings.length === 0
      ? [`${subject} ready`]
      : findings.map(({ message }) => `${subject} ${message}`)),
  ];
}
