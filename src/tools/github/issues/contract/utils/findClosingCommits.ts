import type { IssueCommit } from "#tools/git/index";

export function findClosingCommits(
  commits: readonly IssueCommit[],
): ReadonlyMap<number, IssueCommit> {
  const closes = new Map<number, IssueCommit>();

  for (const commit of commits) {
    for (const number of commit.closes) {
      if (!closes.has(number)) {
        closes.set(number, commit);
      }
    }
  }

  return closes;
}
