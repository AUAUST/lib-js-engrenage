import {
  splitRepository,
  type GithubAccess,
} from "#tools/github/issues/api/index";
import {
  isSameIssue,
  type IssueLocation,
} from "#tools/github/issues/contract/index";
import type { IssueLookup } from "#tools/github/issues/drafts/apis/IssueLookup";

function includes(list: readonly IssueLocation[], location: IssueLocation) {
  return list.some((entry) => isSameIssue(entry, location));
}

export async function linkSubIssues(
  { repository, client }: GithubAccess,
  lookup: IssueLookup,
  parent: number,
  current: readonly IssueLocation[],
  desired: readonly IssueLocation[],
): Promise<void> {
  const route = {
    ...splitRepository(repository),
    issue_number: parent,
  };

  const actual = [
    ...current.filter((location) => includes(desired, location)),
    ...desired.filter((location) => !includes(current, location)),
  ];

  for (const location of desired.filter((child) => !includes(current, child))) {
    const { id } = await lookup.find(location);

    await client.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      {
        ...route,
        sub_issue_id: id,
        replace_parent: true,
      },
    );
  }

  for (const [index, location] of desired.entries()) {
    const placed = actual[index];

    if (placed !== undefined && isSameIssue(placed, location)) {
      continue;
    }

    const neighbour = index === 0 ? actual[0] : desired[index - 1];

    if (neighbour === undefined) {
      continue;
    }

    const [
      { id },
      { id: neighbourId },
    ] = await Promise.all([lookup.find(location), lookup.find(neighbour)]);

    await client.request(
      "PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority",
      {
        ...route,
        sub_issue_id: id,
        ...(index === 0
          ? { before_id: neighbourId }
          : { after_id: neighbourId }),
      },
    );

    actual.splice(
      actual.findIndex((entry) => isSameIssue(entry, location)),
      1,
    );

    actual.splice(index, 0, location);
  }
}
