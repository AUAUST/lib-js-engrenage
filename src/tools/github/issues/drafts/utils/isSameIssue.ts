import type { IssueLocation } from "#tools/github/issues/drafts/types/IssueLocation";

export function isSameIssue(
  left: IssueLocation,
  right: IssueLocation,
): boolean {
  return (
    left.number === right.number &&
    left.repository.toLowerCase() === right.repository.toLowerCase()
  );
}
