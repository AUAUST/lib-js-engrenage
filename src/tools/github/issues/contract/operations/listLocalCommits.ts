import { listIssueCommits, type IssueCommit } from "#tools/git/index";
import { resolveCurrentRepository } from "#tools/github/issues/api/index";
import type { Directory } from "#types/Directory";

export async function listLocalCommits(
  root: Directory,
  repository: string,
): Promise<readonly IssueCommit[]> {
  const local = await resolveCurrentRepository(root);

  return local?.toLowerCase() === repository.toLowerCase()
    ? listIssueCommits(root)
    : [];
}
