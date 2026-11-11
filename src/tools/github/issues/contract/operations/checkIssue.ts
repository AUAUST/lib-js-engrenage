import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { findAncestors } from "#tools/github/issues/contract/operations/findAncestors";
import { findMissingReferences } from "#tools/github/issues/contract/operations/findMissingReferences";
import { listLocalCommits } from "#tools/github/issues/contract/operations/listLocalCommits";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { checkIssueReadiness } from "#tools/github/issues/contract/utils/checkIssueReadiness";
import { findClosingCommits } from "#tools/github/issues/contract/utils/findClosingCommits";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import { renderReference } from "#tools/github/issues/contract/utils/renderReference";
import type { IssueCommit } from "#tools/git/index";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueCheck } from "#tools/github/issues/contract/types/IssueCheck";
import type { RelatedIssue } from "#tools/github/issues/contract/types/RelatedIssue";
import type { Directory } from "#types/Directory";

function relate(
  related: GithubIssue["subIssues"],
  closes: ReadonlyMap<number, IssueCommit>,
  repository: string,
): readonly RelatedIssue[] {
  return related.map((issue) => {
    const local = issue.repository.toLowerCase() === repository.toLowerCase();

    return {
      repository: issue.repository,
      number: issue.number,
      state: issue.state,
      closedBy: issue.state === "open" && local
        ? closes.get(issue.number)
        : undefined,
    };
  });
}

export async function checkIssue(
  access: IssueAccess,
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

  const { repository } = access;

  const report = {
    repository,
    subIssues: relate(issue.subIssues, closes, repository),
    blockedBy: relate(issue.blockedBy, closes, repository),
    towards: commits.filter(({ towards }) => towards.includes(number)),
  };

  if (audience === "debugger" && !dispatch) {
    const findings = checkIssueReadiness(
      {
        issue,
        repository,
        localRepository: repository,
        protocol: access.protocol,
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

  const missingReferences = await findMissingReferences(
    access,
    parsed.references.filter((reference) => reference !== number),
  );

  findings.push(
    ...(audience === "worker"
      ? checkIssueBody(
          issue.body,
          findContractMeaning(access.protocol, issue.type),
          access.protocol,
        )
      : []),
    ...checkIssueReadiness(
      {
        issue,
        repository,
        localRepository: repository,
        protocol: access.protocol,
        parsed,
        ancestors: chain,
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
        { ...access, repository: ancestor.repository },
        body.references.filter((reference) => reference !== ancestor.number),
      );

      const blocked = [
        ...checkIssueBody(
          ancestor.body,
          findContractMeaning(access.protocol, ancestor.type),
          access.protocol,
        ),
        ...checkIssueReadiness(
          {
            issue: ancestor,
            repository: ancestor.repository,
            localRepository: repository,
            protocol: access.protocol,
            parsed: body,
            ancestors: chain.slice(0, index),
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
            message: `Ancestor ${renderReference(ancestor, repository)}: ${finding.message}`,
          };
        }),
      );
    }
  }

  return { findings, ...report };
}
