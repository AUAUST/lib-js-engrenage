import { listIssueCommits, type IssueCommit } from "#tools/git/index";
import { findClosingCommits } from "#tools/github/issues/contract/utils/findClosingCommits";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { LocalCommits } from "#tools/github/issues/contract/types/LocalCommits";

export async function listLocalCommits(
  checkouts: readonly IssueCheckout[],
): Promise<LocalCommits> {
  const commits = new Map(
    await Promise.all(
      checkouts.map(async ({ repository, root, ref }) => {
        return [
          repository.toLowerCase(),
          await listIssueCommits(root, ref),
        ] as const;
      }),
    ),
  );

  const closing = new Map(
    [...commits].map(([repository, list]) => {
      return [repository, findClosingCommits(list)] as const;
    }),
  );

  function relate(
    { repository, number }: IssueLocation,
    relation: (commit: IssueCommit) => readonly number[],
  ) {
    return (commits.get(repository.toLowerCase()) ?? []).filter((commit) => {
      return relation(commit).includes(number);
    });
  }

  function closedBy({ repository, number }: IssueLocation) {
    return closing.get(repository.toLowerCase())?.get(number);
  }

  function towards(issue: IssueLocation) {
    return relate(issue, (commit) => commit.towards);
  }

  function closes(issue: IssueLocation) {
    return relate(issue, (commit) => commit.closes);
  }

  return {
    checkouts,
    closedBy,
    towards,
    closes,
  };
}
