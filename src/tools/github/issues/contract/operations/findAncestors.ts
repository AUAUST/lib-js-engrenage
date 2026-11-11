import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { isSameIssue } from "#tools/github/issues/contract/utils/isSameIssue";
import { renderReference } from "#tools/github/issues/contract/utils/renderReference";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export async function findAncestors(
  access: IssueAccess,
  issue: GithubIssue,
): Promise<{
  chain: (GithubIssue & { readonly repository: string })[];
  findings: IssueFinding[];
}> {
  const chain: (GithubIssue & { readonly repository: string })[] = [];
  const findings: IssueFinding[] = [];

  const seen: IssueLocation[] = [
    { repository: access.repository, number: issue.number },
  ];

  let parent = issue.parent;

  while (parent !== undefined) {
    const current = parent;

    const label = renderReference(current, access.repository);

    if (seen.some((location) => isSameIssue(location, current))) {
      findings.push({
        rule: "ancestor-cycle",
        message: `Ancestor ${label}: cyclic nearest-plan chain.`,
      });

      break;
    }

    seen.push(parent);

    let ancestor: GithubIssue;

    try {
      ancestor = await fetchIssue(
        { ...access, repository: parent.repository },
        parent.number,
      );
    } catch (error) {
      findings.push({
        rule: "ancestor-unavailable",
        message: `Ancestor ${label}: ${error instanceof Error ? error.message : String(error)}`,
      });

      break;
    }

    chain.unshift({ ...ancestor, repository: parent.repository });

    if (ancestor.type === access.protocol.types.plan) {
      break;
    }

    parent = ancestor.parent;
  }

  return { chain, findings };
}
