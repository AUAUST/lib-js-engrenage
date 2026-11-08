import {
  checkIssue,
  findBriefedIssue,
  resolveGithubToken,
} from "#tools/github/index";

export async function checkAgentDispatch(
  role: string,
  brief: string,
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

  const { findings } = await checkIssue(
    { repository: issue.repository, token: await resolveGithubToken() },
    issue.number,
    role,
    { dispatch: true },
  );

  return findings.length === 0
    ? undefined
    : `#${issue.number} is not ready for a ${role}:\n${findings.map(({ message }) => `- ${message}`).join("\n")}`;
}
