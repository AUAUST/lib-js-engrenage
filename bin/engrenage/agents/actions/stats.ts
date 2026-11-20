import {
  claudeSessionVariable,
  formatAgentRuns,
  listAgentSessions,
  readAgentRuns,
  readModelFacts,
  reconcileClaudeRuns,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (requested?: string): Promise<void> {
  const config = await loadValidatedConfig(
    await resolveMainWorktree(process.cwd()),
    { reporter: getRunContext().reporter },
  );

  const resources = await config.resolve("resources");

  const directory = resources.path("agents.stats");

  await reconcileClaudeRuns(directory, await listAgentSessions(directory));

  const runs = await readAgentRuns(directory);

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

  getRunContext().reporter.log(
    `Session ${session}\n\n${formatAgentRuns(selected, await readModelFacts())}`,
  );
}
