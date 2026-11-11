import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export function renderReference(
  { repository, number }: IssueLocation,
  target: string,
): string {
  return repository.toLowerCase() === target.toLowerCase()
    ? `#${number}`
    : `${repository}#${number}`;
}
