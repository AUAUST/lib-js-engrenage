import {
  claudeSessionVariable,
  formatAgentRuns,
  readAgentRuns,
} from "#tools/agents/index";
import { resolveMainWorktree } from "#tools/git/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (requested?: string): Promise<void> {
  const config = await loadValidatedConfig(
    await resolveMainWorktree(process.cwd()),
  );

  const resources = await config.resolve("resources");

  const runs = await readAgentRuns(resources.path("agents.stats"));

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

  process.stdout.write(`Session ${session}\n\n${formatAgentRuns(selected)}\n`);
}
