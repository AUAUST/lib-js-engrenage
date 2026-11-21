import { ShellSyntaxError } from "#foundation/shell/index";
import {
  createGithubClient,
  resolveRepository,
} from "#tools/github/issues/api/index";
import { fetchIssue } from "#tools/github/issues/contract/operations/fetchIssue";
import { parseGithubCommand } from "#tools/github/issues/contract/operations/parseGithubCommand";
import { readGithubBody } from "#tools/github/issues/contract/operations/readGithubBody";
import { checkIssueBody } from "#tools/github/issues/contract/utils/checkIssueBody";
import { findContractMeaning } from "#tools/github/issues/contract/utils/findContractMeaning";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";
import type { GithubWrite } from "#tools/github/issues/contract/types/GithubWrite";
import type { Directory } from "#types/Directory";

async function checkWrite(
  write: GithubWrite,
  cwd: Directory,
  repositories: () => Promise<ReadonlyMap<string, string>>,
  contractNames: ContractNames,
): Promise<string | undefined> {
  if (write.action === "create") {
    return "create issues as drafts with `pnpm engrenage planning issue create <type>` and publish them with `pnpm engrenage planning issue publish <refs>`, which set the type and fields";
  }

  if (write.action === "comment" || write.body === undefined) {
    return;
  }

  const body = await readGithubBody(write.body, cwd);

  if (body === undefined && "path" in write.body) {
    return `the body file \`${write.body.path}\` does not exist when the hook runs, before the command: write it in an earlier call`;
  }

  if (body === undefined) {
    return "the hook reads only a literal `--body`, a literal `--body-file` path (after literal `cd`s), or a heredoc, here-string or `cat` pipe into `--body-file -`; variables, substitutions and other pipes cannot be checked";
  }

  const issue = write.action === "edit" && write.number !== undefined
    ? await fetchIssue(
        {
          repository: await resolveRepository(
            { root: cwd, repositories },
            write.repository,
          ),
          client: await createGithubClient(),
          contractNames,
        },
        write.number,
      )
    : undefined;

  const findings = checkIssueBody(
    body,
    findContractMeaning(contractNames, issue?.type),
    contractNames,
    issue?.subIssues.length ?? 0,
  );

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
  repositories: () => Promise<ReadonlyMap<string, string>>,
  contractNames: ContractNames,
): Promise<string | undefined> {
  let writes;

  try {
    writes = parseGithubCommand(command);
  } catch (error) {
    if (error instanceof ShellSyntaxError) {
      return `the command is not valid shell: ${error.message}`;
    }

    throw error;
  }

  const reasons = await Promise.all(
    writes.map(async (write) => {
      const reason = await checkWrite(write, cwd, repositories, contractNames);

      return reason === undefined
        ? undefined
        : `gh issue ${write.action}${write.number === undefined ? "" : ` ${write.number}`}: ${reason}`;
    }),
  );

  return reasons.find((reason) => reason !== undefined);
}
