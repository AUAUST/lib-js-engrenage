import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import type { GithubIssue } from "#tools/github/issues/contract/types/GithubIssue";
import type { IssueAccess } from "#tools/github/issues/contract/types/IssueAccess";
import type { IssueFinding } from "#tools/github/issues/contract/types/IssueFinding";

export async function findAncestors(
  access: IssueAccess,
  issue: GithubIssue,
): Promise<{ chain: GithubIssue[]; findings: IssueFinding[] }> {
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

    if (ancestor.type === access.protocol.types.plan) {
      break;
    }

    parent = ancestor.parent;
  }

  return { chain, findings };
}
