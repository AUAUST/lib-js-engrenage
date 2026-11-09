import { listIssueCommits, type IssueCommit } from "#tools/git/index";
import { fetchIssue } from "#tools/github/operations/fetchIssue";
import { requestGithub } from "#tools/github/operations/requestGithub";
import { resolveRepository } from "#tools/github/operations/resolveRepository";
import { checkIssueBody } from "#tools/github/utils/checkIssueBody";
import { checkIssueReadiness } from "#tools/github/utils/checkIssueReadiness";
import { parseIssueBody } from "#tools/github/utils/parseIssueBody";
import type { GithubAccess } from "#tools/github/types/GithubAccess";
import type { GithubIssue } from "#tools/github/types/GithubIssue";
import type { IssueAudience } from "#tools/github/types/IssueAudience";
import type { IssueCheck } from "#tools/github/types/IssueCheck";
import type { IssueFinding } from "#tools/github/types/IssueFinding";
import type { RelatedIssue } from "#tools/github/types/RelatedIssue";
import type { Directory } from "#types/Directory";

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

async function listLocalCommits(root: Directory, repository: string) {
  let local: string;

  try {
    local = await resolveRepository(root);
  } catch {
    // @debt treats any failure to resolve the working copy's repository as a foreign repository instead of telling a missing remote from a git failure
    return [];
  }

  return local.toLowerCase() === repository.toLowerCase()
    ? listIssueCommits(root)
    : [];
}

function findClosingCommits(commits: readonly IssueCommit[]) {
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

function relate(
  related: GithubIssue["subIssues"],
  closes: ReadonlyMap<number, IssueCommit>,
): readonly RelatedIssue[] {
  return related.map(({ number, state }) => {
    return {
      number,
      state,
      closedBy: state === "open" ? closes.get(number) : undefined,
    };
  });
}

export async function checkIssue(
  access: GithubAccess,
  number: number,
  audience: IssueAudience = "worker",
  { dispatch = false, root }: { dispatch?: boolean; root?: Directory } = {},
): Promise<IssueCheck> {
  const [issue, commits] = await Promise.all([
    fetchIssue(access, number),
    root === undefined ? [] : listLocalCommits(root, access.repository),
  ]);

  const parsed = parseIssueBody(issue.body);

  const closes = findClosingCommits(commits);

  const report = {
    subIssues: relate(issue.subIssues, closes),
    blockedBy: relate(issue.blockedBy, closes),
    towards: commits.filter(({ towards }) => towards.includes(number)),
  };

  if (audience === "debugger" && !dispatch) {
    const findings = checkIssueReadiness(
      {
        issue,
        parsed,
        ancestors: [],
        missingReferences: [],
        closes,
      },
      audience,
    );

    return { findings, ...report };
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
        closes,
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
            closes,
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

  return { findings, ...report };
}
