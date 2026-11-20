import {
  claudeSessionVariable,
  formatAgentAggregate,
  formatAgentRuns,
  listAgentSessions,
  readAgentRuns,
  readModelFacts,
  reconcileClaudeRuns,
  type AgentRun,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

function selectSince(
  runs: readonly AgentRun[],
  since: string | undefined,
): readonly AgentRun[] {
  if (since === undefined) {
    return runs;
  }

  const start = Date.parse(since);

  if (Number.isNaN(start)) {
    throw new TypeError(`Invalid date for --since: ${since}`);
  }

  return runs.filter((run) => {
    return run.started !== undefined && Date.parse(run.started) >= start;
  });
}

function selectSession(
  runs: readonly AgentRun[],
  requested: string | undefined,
): { session: string; selected: readonly AgentRun[] } {
  const latest = runs
    .toSorted((left, right) => {
      return (right.ended ?? "").localeCompare(left.ended ?? "");
    })
    .at(0)?.session;

  const session = requested ?? process.env[claudeSessionVariable] ?? latest;

  const selected = runs.filter((run) => run.session === session);

  if (session === undefined || selected.length === 0) {
    throw new Error(
      session === undefined
        ? "No agent run recorded"
        : `No agent run recorded for session ${session}`,
    );
  }

  return { session, selected };
}

export default async function (
  requested: string | undefined,
  { all, since }: { all: boolean; since?: string },
): Promise<void> {
  const config = await loadValidatedConfig(
    await resolveMainWorktree(process.cwd()),
    { reporter: getRunContext().reporter },
  );

  const resources = await config.resolve("resources");

  const directory = resources.path("agents.stats");

  await reconcileClaudeRuns(directory, await listAgentSessions(directory));

  const runs = await readAgentRuns(directory);

  const facts = await readModelFacts();

  if (all || since !== undefined) {
    const selected = selectSince(runs, since);

    if (selected.length === 0) {
      throw new Error("No agent run recorded");
    }

    getRunContext().reporter.log(
      `${since === undefined ? "Every session" : `Since ${since}`}\n\n${formatAgentAggregate(selected, facts)}`,
    );

    return;
  }

  const { session, selected } = selectSession(runs, requested);

  getRunContext().reporter.log(
    `Session ${session}\n\n${formatAgentRuns(selected, facts)}`,
  );
}
