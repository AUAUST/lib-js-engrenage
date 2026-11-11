import {
  createGithubClient,
  resolveRepository,
} from "#tools/github/issues/api/index";
import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { readGithubBody } from "#tools/github/issues/contract/operations/readGithubBody";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { parseGithubCommand } from "#tools/github/issues/contract/utils/parseGithubCommand";
import type { GithubWrite } from "#tools/github/issues/contract/types/GithubWrite";
import type { Directory } from "#types/Directory";

async function checkWrite(
  write: GithubWrite,
  cwd: Directory,
  repositories: ReadonlyMap<string, string>,
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
        repository: await resolveRepository(
          { root: cwd, repositories },
          write.repository,
        ),
        client: await createGithubClient(),
      },
      write.number,
    );

    type = issue.type;
  }

  const findings = checkIssueBody(body, type);

  return findings.length === 0
    ? undefined
    : `the issue body breaks the issue contract:\n${findings
        .map(({ message }) => {
          return `- ${message}`;
        })
        .join("\n")}`;
}

export async function checkGithubWrite(
  command: string,
  cwd: Directory,
  repositories: ReadonlyMap<string, string>,
): Promise<string | undefined> {
  const writes = parseGithubCommand(command);

  const reasons = await Promise.all(
    writes.map(async (write) => {
      const reason = await checkWrite(write, cwd, repositories);

      return reason === undefined
        ? undefined
        : `gh issue ${write.action}${write.number === undefined ? "" : ` ${write.number}`}: ${reason}`;
    }),
  );

  return reasons.find((reason) => reason !== undefined);
}
