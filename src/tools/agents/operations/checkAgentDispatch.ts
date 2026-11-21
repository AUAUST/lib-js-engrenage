import {
  checkDraftFile,
  checkIssue,
  createGithubClient,
  findBriefedIssue,
  isBlockingFinding,
  isMissingResource,
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

async function explainReadFailure(
  error: unknown,
  repository: string,
  repositories: () => Promise<ReadonlyMap<string, string>>,
) {
  const reason = error instanceof Error ? error.message : String(error);

  if (!isMissingResource(error)) {
    return reason;
  }

  const registry = await repositories();

  const registered = [...registry.values()];

  const known = registered.some((name) => {
    return name.toLowerCase() === repository.toLowerCase();
  });

  return known
    ? reason
    : `${reason}; \`${repository}\` is not a registered repository: ${registered.join(", ") || "none"}`;
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

  try {
    const { findings: found } = await checkIssue(
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

    const findings = found.filter(isBlockingFinding);

    return findings.length === 0
      ? undefined
      : formatFindings(
          `#${issue.number}`,
          role,
          findings.map(({ message }) => message),
        );
  } catch (error) {
    const reason = await explainReadFailure(
      error,
      issue.repository,
      repositories,
    );

    return `${issue.repository}#${issue.number} could not be checked for a ${role}: ${reason}`;
  }
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

  const findings = await checkDraftFile(config, value, role);

  return findings.length === 0
    ? undefined
    : formatFindings(
        `\`${value}\``,
        role,
        findings.map(({ message }) => message),
      );
}
