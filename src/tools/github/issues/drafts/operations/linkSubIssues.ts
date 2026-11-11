import {
  splitRepository,
  type GithubAccess,
} from "#tools/github/issues/api/index";
import type { IssueLookup } from "#tools/github/issues/drafts/types/IssueLookup";

export async function linkSubIssues(
  { repository, client }: GithubAccess,
  lookup: IssueLookup,
  parent: number,
  current: readonly number[],
  desired: readonly number[],
): Promise<void> {
  const route = { ...splitRepository(repository), issue_number: parent };

  const actual = [
    ...current.filter((number) => desired.includes(number)),
    ...desired.filter((number) => !current.includes(number)),
  ];

  for (const number of desired.filter((child) => !current.includes(child))) {
    const { id } = await lookup.find(number);

    await client.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues",
      { ...route, sub_issue_id: id },
    );
  }

  for (const [index, number] of desired.entries()) {
    if (actual[index] === number) {
      continue;
    }

    const neighbour = index === 0 ? actual[0] : desired[index - 1];

    if (neighbour === undefined) {
      continue;
    }

    const [
      { id },
      { id: neighbourId },
    ] = await Promise.all([lookup.find(number), lookup.find(neighbour)]);

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

    actual.splice(actual.indexOf(number), 1);

    actual.splice(index, 0, number);
  }
}
