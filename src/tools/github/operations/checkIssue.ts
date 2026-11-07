import { fetchIssue } from "#tools/github/operations/fetchIssue";
import { requestGithub } from "#tools/github/operations/requestGithub";
import { checkIssueBody } from "#tools/github/utils/checkIssueBody";
import { checkIssueReadiness } from "#tools/github/utils/checkIssueReadiness";
import { parseIssueBody } from "#tools/github/utils/parseIssueBody";
import type { GithubAccess } from "#tools/github/types/GithubAccess";
import type { GithubIssue } from "#tools/github/types/GithubIssue";
import type { IssueAudience } from "#tools/github/types/IssueAudience";
import type { IssueFinding } from "#tools/github/types/IssueFinding";

async function findAncestors(access: GithubAccess, issue: GithubIssue) {
  const chain: number[] = [];

  let parent = issue.parent;

  while (parent !== undefined) {
    const ancestor = await fetchIssue(access, parent);

    chain.unshift(ancestor.number);

    if (ancestor.type === "Plan") {
      break;
    }

    parent = ancestor.parent;
  }

  return chain;
}

async function findMissingReferences(
  { repository, token }: GithubAccess,
  numbers: readonly number[],
) {
  const found = await Promise.all(
    numbers.map(async (number) => {
      const issue = await requestGithub(
        token,
        `/repos/${repository}/issues/${number}`,
        { missing: "undefined" },
      );

      return issue === undefined ? number : undefined;
    }),
  );

  return found.filter((number) => number !== undefined);
}

export async function checkIssue(
  access: GithubAccess,
  number: number,
  audience: IssueAudience = "worker",
): Promise<IssueFinding[]> {
  const issue = await fetchIssue(access, number);

  const parsed = parseIssueBody(issue.body);

  if (audience === "debugger") {
    return checkIssueReadiness(
      {
        issue,
        parsed,
        ancestors: [],
        missingReferences: [],
      },
      audience,
    );
  }

  const ancestors = await findAncestors(access, issue);

  const missingReferences = await findMissingReferences(
    access,
    parsed.references.filter((reference) => reference !== number),
  );

  return [
    ...checkIssueBody(issue.body, issue.type),
    ...checkIssueReadiness(
      {
        issue,
        parsed,
        ancestors,
        missingReferences,
      },
      audience,
    ),
  ];
}
