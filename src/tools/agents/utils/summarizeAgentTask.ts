import { mainAgent, reportMarkers } from "#tools/agents/constants";
import { isBacklogId } from "#tools/agents/utils/isBacklogId";
import { findBriefedIssue } from "#tools/github/index";
import type { AgentOutcome } from "#tools/agents/types/AgentOutcome";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { AgentTask } from "#tools/agents/types/AgentTask";
import type { AgentTranscript } from "#tools/agents/types/AgentTranscript";

const headerPattern = /^[A-Z][\w-]*:/u;

const draftPattern = /^Draft:[ \t]*(\S.*?)[ \t]*$/u;

const backlogPattern = /^Backlog:[ \t]*(\S+)[ \t]*$/u;

const decorationPattern = /^[\s#>*_`]+/u;

function readHeaders(brief: string): readonly string[] {
  const lines = brief.split(/\r?\n/u);

  const end = lines.findIndex((line) => !headerPattern.test(line));

  return end === -1 ? lines : lines.slice(0, end);
}

function findOutcome(report: string | undefined): AgentOutcome {
  if (report === undefined) {
    return "unreported";
  }

  const opening = report.replace(decorationPattern, "");

  const marked = reportMarkers.find(({ marker }) => {
    return opening.startsWith(marker);
  });

  return marked?.outcome ?? "completion";
}

export function summarizeAgentTask(
  { agent }: Pick<AgentRun, "agent">,
  { brief, report }: Pick<AgentTranscript, "brief" | "report">,
): AgentTask {
  const headers = brief === undefined ? [] : readHeaders(brief);

  const issue = brief === undefined ? undefined : findBriefedIssue(brief);

  const draft = headers
    .map((line) => {
      return draftPattern.exec(line)?.[1];
    })
    .find((path) => path !== undefined);

  const backlog = headers
    .map((line) => {
      return backlogPattern.exec(line)?.[1];
    })
    .filter((entry) => entry !== undefined)
    .filter(isBacklogId);

  return {
    ...(issue === undefined
      ? {}
      : { issue: `${issue.repository}#${issue.number}` }),
    ...(draft === undefined ? {} : { draft }),
    ...(backlog.length === 0 ? {} : { backlog }),
    ...(agent === mainAgent ? {} : { outcome: findOutcome(report) }),
  };
}
