import {
  checkDraftFile,
  checkIssue,
  createGithubClient,
  findBriefedIssue,
  resolveIssueCheckouts,
  type IssueAudience,
} from "#tools/github/index";
import { readLinkedCheckouts } from "#tools/pnpm/index";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";

const firstLinePattern = /^(Issue|Draft):[ \t]*(.*?)[ \t]*\r?(?:\n|$)/;

const laterLinePattern = /\n[ \t]*((?:Issue|Draft):)/;

function formatFindings(
  subject: string,
  role: string,
  messages: readonly string[],
) {
  return `${subject} is not ready for a ${role}:\n${messages
    .map((message) => `- ${message}`)
    .join("\n")}`;
}

async function checkBriefedIssue(
  config: LoadedConfig,
  role: IssueAudience,
  brief: string,
  root: Directory,
) {
  const issue = findBriefedIssue(brief);

  if (issue === undefined) {
    return "write the first line as `Issue: <owner>/<repo>#<n>`";
  }

  const {
    contract: contractNames,
    repositories,
  } = await config.resolve("github");

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
    : formatFindings(
        `#${issue.number}`,
        role,
        findings.map(({ message }) => message),
      );
}

/**
 * Checks a worker or debugger brief whose first line names an issue or a local
 * draft, and denies one naming either on a later line.
 */
export async function checkAgentDispatch(
  config: LoadedConfig,
  role: string,
  brief: string,
  root: Directory,
): Promise<string | undefined> {
  if (role !== "worker" && role !== "debugger") {
    return;
  }

  const first = firstLinePattern.exec(brief);

  if (first === null) {
    const later = laterLinePattern.exec(brief);

    return later === null
      ? undefined
      : `move the \`${later[1]}\` line to the first line of the brief`;
  }

  const [, kind, value = ""] = first;

  if (kind === "Issue") {
    return checkBriefedIssue(config, role, brief, root);
  }

  const findings = await checkDraftFile(config, value);

  return findings.length === 0
    ? undefined
    : formatFindings(
        `\`${value}\``,
        role,
        findings.map(({ message }) => message),
      );
}
