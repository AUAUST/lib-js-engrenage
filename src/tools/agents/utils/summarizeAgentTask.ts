import {
  mainAgent,
  plannerModes,
  plannerRole,
  reportMarkers,
} from "#tools/agents/constants";
import { findBriefedIssue } from "#tools/github/index";
import type { AgentOutcome } from "#tools/agents/types/AgentOutcome";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { AgentTask } from "#tools/agents/types/AgentTask";
import type { AgentTranscript } from "#tools/agents/types/AgentTranscript";
import type { PlannerMode } from "#tools/agents/types/PlannerMode";

const headerPattern = /^[A-Z][\w-]*:/u;

const draftPattern = /^Draft:[ \t]*(\S.*?)[ \t]*$/u;

const backlogPattern = /^Backlog:[ \t]*([\w-]+\.\d+)[ \t]*$/u;

const modePattern = new RegExp(
  String.raw`\b(${plannerModes.join("|")})\b`,
  "u",
);

const decorationPattern = /^[\s#>*_`]+/u;

function readHeaders(brief: string): readonly string[] {
  const lines = brief.split(/\r?\n/u);

  const end = lines.findIndex((line) => !headerPattern.test(line));

  return end === -1 ? lines : lines.slice(0, end);
}

function isPlannerMode(word: string | undefined): word is PlannerMode {
  return plannerModes.some((mode) => mode === word);
}

// @debt planner briefs state their mode as a bare word anywhere in the text, so a brief naming another mode first records that one; a `Mode:` header line would make it exact
function findPlannerMode(brief: string): PlannerMode | undefined {
  const word = modePattern.exec(brief)?.[1];

  return isPlannerMode(word) ? word : undefined;
}

// @debt blocked reports carry no opening marker, so they count as completions; a `Blocked:` opening would tell them apart
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
  { agent, role }: Pick<AgentRun, "agent" | "role">,
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
    .filter((entry) => entry !== undefined);

  const mode = brief !== undefined && role === plannerRole
    ? findPlannerMode(brief)
    : undefined;

  return {
    ...(issue === undefined
      ? {}
      : { issue: `${issue.repository}#${issue.number}` }),
    ...(draft === undefined ? {} : { draft }),
    ...(backlog.length === 0 ? {} : { backlog }),
    ...(mode === undefined ? {} : { mode }),
    ...(agent === mainAgent ? {} : { outcome: findOutcome(report) }),
  };
}
