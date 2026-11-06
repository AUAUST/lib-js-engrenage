import { fetchIssue } from "#tools/github/operations/fetchIssue";
import { readGithubBody } from "#tools/github/operations/readGithubBody";
import { resolveGithubToken } from "#tools/github/operations/resolveGithubToken";
import { resolveRepository } from "#tools/github/operations/resolveRepository";
import { checkIssueBody } from "#tools/github/utils/checkIssueBody";
import { parseGithubCommand } from "#tools/github/utils/parseGithubCommand";
import type { Directory } from "#types/Directory";

export async function checkGithubWrite(
  command: string,
  cwd: Directory,
): Promise<string | undefined> {
  const write = parseGithubCommand(command);

  if (
    write === undefined ||
    write.action === "comment" ||
    write.body === undefined
  ) {
    return;
  }

  const body = await readGithubBody(write.body, cwd);

  if (body === undefined) {
    return "pass the body with `--body-file -` and a heredoc";
  }

  let type: string | undefined;

  if (write.action === "edit" && write.number !== undefined) {
    const issue = await fetchIssue(
      {
        repository: await resolveRepository(cwd, write.repository),
        token: await resolveGithubToken(),
      },
      write.number,
    );

    type = issue.type;
  }

  const findings = checkIssueBody(body, type);

  return findings.length === 0
    ? undefined
    : `the issue body breaks the issue contract:\n${findings.map(({ message }) => `- ${message}`).join("\n")}`;
}
