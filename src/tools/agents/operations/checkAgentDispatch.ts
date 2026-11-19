import {
  checkIssue,
  createGithubClient,
  findBriefedIssue,
  resolveIssueCheckouts,
  type ContractNames,
} from "#tools/github/index";
import { readLinkedCheckouts } from "#tools/pnpm/index";
import type { Directory } from "#types/Directory";

export async function checkAgentDispatch(
  role: string,
  brief: string,
  root: Directory,
  {
    contractNames,
    repositories,
  }: {
    contractNames: ContractNames;
    repositories(): Promise<ReadonlyMap<string, string>>;
  },
): Promise<string | undefined> {
  if (role !== "worker" && role !== "debugger") {
    return;
  }

  const issue = findBriefedIssue(brief);

  if (issue === undefined) {
    return role === "worker"
      ? "brief a worker with `Issue: <owner>/<repo>#<n>` on the first line"
      : undefined;
  }

  const linked = await readLinkedCheckouts(root);

  const checkouts = await resolveIssueCheckouts(
    {
      root,
      repositories,
      linked,
    },
    [],
  );

  const { findings } = await checkIssue(
    {
      repository: issue.repository,
      client: await createGithubClient(),
      contractNames,
    },
    issue.number,
    role,
    {
      dispatch: true,
      checkouts,
    },
  );

  return findings.length === 0
    ? undefined
    : `#${issue.number} is not ready for a ${role}:\n${findings
        .map(({ message }) => {
          return `- ${message}`;
        })
        .join("\n")}`;
}
