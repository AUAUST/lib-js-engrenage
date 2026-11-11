import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { findAncestors } from "#tools/github/issues/contract/operations/findAncestors";
import { findMissingReferences } from "#tools/github/issues/contract/operations/findMissingReferences";
import { listLocalCommits } from "#tools/github/issues/contract/operations/listLocalCommits";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { checkIssueReadiness } from "#tools/github/issues/contract/utils/checkIssueReadiness";
import { findClosingCommits } from "#tools/github/issues/contract/utils/findClosingCommits";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
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

  const report = {
    subIssues: relate(issue.subIssues, closes),
    blockedBy: relate(issue.blockedBy, closes),
    towards: commits.filter(({ towards }) => towards.includes(number)),
  };

  if (audience === "debugger" && !dispatch) {
    const findings = checkIssueReadiness(
      {
        issue,
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

  const ancestors = chain.map(({ number }) => number);

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
        protocol: access.protocol,
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
        ...checkIssueBody(
          ancestor.body,
          findContractMeaning(access.protocol, ancestor.type),
          access.protocol,
        ),
        ...checkIssueReadiness(
          {
            issue: ancestor,
            protocol: access.protocol,
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
