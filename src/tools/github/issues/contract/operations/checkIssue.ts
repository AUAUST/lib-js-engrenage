import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { findAncestors } from "#tools/github/issues/contract/operations/findAncestors";
import { findMissingReferences } from "#tools/github/issues/contract/operations/findMissingReferences";
import { listLocalCommits } from "#tools/github/issues/contract/operations/listLocalCommits";
import { checkIssueContract } from "#tools/github/issues/contract/utils/checkIssueContract";
import { checkIssueReadiness } from "#tools/github/issues/contract/utils/checkIssueReadiness";
import { checkIssueSpec } from "#tools/github/issues/contract/utils/checkIssueSpec";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import { parseIssueBody } from "#tools/github/issues/contract/utils/parseIssueBody";
import { renderReference } from "#tools/github/issues/contract/utils/renderReference";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueCheck } from "#tools/github/issues/contract/types/IssueCheck";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { LocalCommits } from "#tools/github/issues/contract/types/LocalCommits";
import type { RelatedIssue } from "#tools/github/issues/contract/types/RelatedIssue";

function relate(
  related: GithubIssue["subIssues"],
  commits: LocalCommits,
): readonly RelatedIssue[] {
  return related.map((issue) => {
    return {
      repository: issue.repository,
      number: issue.number,
      state: issue.state,
      closedBy: issue.state === "open" ? commits.closedBy(issue) : undefined,
    };
  });
}

export async function checkIssue(
  access: IssueAccess,
  number: number,
  audience: IssueAudience = "worker",
  {
    dispatch = false,
    checkouts = [],
  }: { dispatch?: boolean; checkouts?: readonly IssueCheckout[] } = {},
): Promise<IssueCheck> {
  const [issue, commits] = await Promise.all([
    fetchIssue(access, number),
    listLocalCommits(checkouts),
  ]);

  const parsed = parseIssueBody(issue.body);

  const { repository } = access;

  const report = {
    repository,
    subIssues: relate(issue.subIssues, commits),
    blockedBy: relate(issue.blockedBy, commits),
    towards: commits.towards({ repository, number }),
  };

  if (audience === "debugger" && !dispatch) {
    const findings = checkIssueReadiness(
      {
        issue,
        repository,
        currentRepository: repository,
        contractNames: access.contractNames,
        parsed,
        ancestors: [],
        missingReferences: [],
        commits,
      },
      audience,
    );

    return { findings, ...report };
  }

  const { chain, findings } = await findAncestors(access, issue);

  const { contractNames } = access;
  const [topmost] = chain;

  const missingReferences = await findMissingReferences(
    access,
    parsed.references.filter((reference) => reference !== number),
  );

  findings.push(
    ...(audience === "worker"
      ? checkIssueContract(
          issue.body,
          findContractMeaning(access.contractNames, issue.type),
          access.contractNames,
          { subIssues: issue.subIssues.length, complete: true },
        )
      : []),
    ...checkIssueReadiness(
      {
        issue,
        repository,
        currentRepository: repository,
        contractNames: access.contractNames,
        parsed,
        ancestors: chain,
        missingReferences,
        commits,
        dispatch,
      },
      audience,
    ),
    ...checkIssueSpec(parsed, {
      plan: topmost?.type === contractNames.types.plan
        ? parseIssueBody(topmost.body)
        : undefined,
      trivial: (
        issue.fields[contractNames.fields.complexity] ===
        contractNames.options.trivial
      ),
      subIssues: issue.subIssues.length,
    }),
  );

  // @debt Debugger dispatch skips the issue's own contract but still checks each ancestor's, so an old-format parent or a plan without **Done when** refuses a debugger the leniency its leaf gets.
  if (dispatch) {
    for (const [index, ancestor] of chain.entries()) {
      const body = parseIssueBody(ancestor.body);

      const missing = await findMissingReferences(
        { ...access, repository: ancestor.repository },
        body.references.filter((reference) => reference !== ancestor.number),
      );

      const blocked = [
        ...checkIssueContract(
          ancestor.body,
          findContractMeaning(access.contractNames, ancestor.type),
          access.contractNames,
          { subIssues: ancestor.subIssues.length, complete: true },
        ),
        ...checkIssueReadiness(
          {
            issue: ancestor,
            repository: ancestor.repository,
            currentRepository: repository,
            contractNames: access.contractNames,
            parsed: body,
            ancestors: chain.slice(0, index),
            missingReferences: missing,
            commits,
            dispatch: true,
            ancestor: true,
            aboveParent: index < chain.length - 1,
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
