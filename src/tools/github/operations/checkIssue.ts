import { fetchIssue } from "#tools/github/operations/fetchIssue";
import { requestGithub } from "#tools/github/operations/requestGithub";
import { checkIssueBody } from "#tools/github/utils/checkIssueBody";
import { checkIssueReadiness } from "#tools/github/utils/checkIssueReadiness";
import { parseIssueBody } from "#tools/github/utils/parseIssueBody";
import type { GithubAccess } from "#tools/github/types/GithubAccess";
import type { GithubIssue } from "#tools/github/types/GithubIssue";
import type { IssueAudience } from "#tools/github/types/IssueAudience";
import type { IssueCheck } from "#tools/github/types/IssueCheck";
import type { IssueFinding } from "#tools/github/types/IssueFinding";

async function findAncestors(access: GithubAccess, issue: GithubIssue) {
  const chain: GithubIssue[] = [];
  const findings: IssueFinding[] = [];
  const seen = new Set([issue.number]);

  let parent = issue.parent;

  while (parent !== undefined) {
    if (seen.has(parent)) {
      findings.push({
        rule: "ancestor-cycle",
        message: `Ancestor #${parent}: cyclic nearest-plan chain.`,
      });

      break;
    }

    seen.add(parent);

    let ancestor: GithubIssue;

    try {
      ancestor = await fetchIssue(access, parent);
    } catch (error) {
      findings.push({
        rule: "ancestor-unavailable",
        message: `Ancestor #${parent}: ${error instanceof Error ? error.message : String(error)}`,
      });

      break;
    }

    chain.unshift(ancestor);

    if (ancestor.type === "Plan") {
      break;
    }

    parent = ancestor.parent;
  }

  return { chain, findings };
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
  { dispatch = false }: { dispatch?: boolean } = {},
): Promise<IssueCheck> {
  const issue = await fetchIssue(access, number);

  const parsed = parseIssueBody(issue.body);

  const openSubIssues = issue.subIssues
    .filter(({ state }) => state === "open")
    .map(({ number }) => number);

  if (audience === "debugger" && !dispatch) {
    const findings = checkIssueReadiness(
      {
        issue,
        parsed,
        ancestors: [],
        missingReferences: [],
      },
      audience,
    );

    return { findings, openSubIssues };
  }

  const { chain, findings } = await findAncestors(access, issue);

  const ancestors = chain.map(({ number }) => number);

  const missingReferences = await findMissingReferences(
    access,
    parsed.references.filter((reference) => reference !== number),
  );

  findings.push(
    ...(audience === "worker" ? checkIssueBody(issue.body, issue.type) : []),
    ...checkIssueReadiness(
      {
        issue,
        parsed,
        ancestors,
        missingReferences,
        dispatch,
      },
      audience,
    ),
  );

  if (dispatch) {
    for (const [index, ancestor] of chain.entries()) {
      const body = parseIssueBody(ancestor.body);

      const missing = await findMissingReferences(
        access,
        body.references.filter((reference) => reference !== ancestor.number),
      );

      const blocked = [
        ...checkIssueBody(ancestor.body, ancestor.type),
        ...checkIssueReadiness(
          {
            issue: ancestor,
            parsed: body,
            ancestors: ancestors.slice(0, index),
            missingReferences: missing,
            dispatch: true,
            ancestor: true,
          },
          audience,
        ),
      ];

      findings.push(
        ...blocked.map((finding) => {
          return {
            ...finding,
            message: `Ancestor #${ancestor.number}: ${finding.message}`,
          };
        }),
      );
    }
  }

  return { findings, openSubIssues };
}
