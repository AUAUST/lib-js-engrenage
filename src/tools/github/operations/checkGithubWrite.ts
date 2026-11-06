import { fetchIssue } from "#tools/github/operations/fetchIssue";
import { readGithubBody } from "#tools/github/operations/readGithubBody";
import { resolveGithubToken } from "#tools/github/operations/resolveGithubToken";
import { resolveRepository } from "#tools/github/operations/resolveRepository";
import { checkIssueBody } from "#tools/github/utils/checkIssueBody";
import { parseGithubCommand } from "#tools/github/utils/parseGithubCommand";
import type { GithubWrite } from "#tools/github/types/GithubWrite";
import type { Directory } from "#types/Directory";

async function checkWrite(
  write: GithubWrite,
  cwd: Directory,
): Promise<string | undefined> {
  if (write.action === "comment" || write.body === undefined) {
    return;
  }

  if (write.body.kind === "file" && write.body.path.endsWith(".draft.md")) {
    return "publish a draft without its frontmatter: pipe its body to `--body-file -`";
  }

  const body = await readGithubBody(write.body, cwd);

  if (body === undefined && "path" in write.body) {
    return `the body file \`${write.body.path}\` does not exist`;
  }

  if (body === undefined) {
    return "pass the body with `--body-file -` and a heredoc, or pipe it from a `.draft.md` file";
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

export async function checkGithubWrite(
  command: string,
  cwd: Directory,
): Promise<string | undefined> {
  const writes = parseGithubCommand(command);

  const reasons = await Promise.all(
    writes.map(async (write) => {
      const reason = await checkWrite(write, cwd);

      return reason === undefined
        ? undefined
        : `gh issue ${write.action}${write.number === undefined ? "" : ` ${write.number}`}: ${reason}`;
    }),
  );

  return reasons.find((reason) => reason !== undefined);
}
