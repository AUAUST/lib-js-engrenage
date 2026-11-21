import { resolveWithin } from "#foundation/filesystem/index";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
import { readRunningAgents } from "#tools/agents/operations/readRunningAgents";
import { formatCount } from "#tools/agents/utils/formatCount";
import type { LoadedConfig } from "#project/config/index";

async function resolveCeiling(
  config: LoadedConfig,
  role: string,
): Promise<number | undefined> {
  const definitions = await getSkillDefinitions({
    extensions: await listActiveExtensions(config),
  });

  return definitions.find(({ agent }) => agent?.name === role)?.agent?.ceiling;
}

export async function checkAgentResume(
  config: LoadedConfig,
  target: { session: string; recipient: string },
): Promise<string | undefined> {
  const resources = await config.resolve("resources");

  const directory = resolveWithin(
    resources.path("agents.stats"),
    target.session,
  );

  const [runs, running] = await Promise.all([
    readAgentRuns(directory),
    readRunningAgents(directory),
  ]);

  // @debt a recipient that is not an agent id resolves to the agents whose role it names, so an agent addressed by any other name escapes the limit
  const name = target.recipient.replace(/ \[[^\]]*\]$/u, "");

  const isRecipient = (
    [...runs, ...running].some(({ agent }) => {
      return agent === name;
    })
  )
    ? ({ agent }: { agent: string }) => agent === name
    : ({ role }: { role: string }) => role === name;

  if (running.some(isRecipient)) {
    return;
  }

  const run = runs
    .filter(isRecipient)
    .toSorted((a, b) => (b.ended ?? "").localeCompare(a.ended ?? ""))
    .at(0);

  if (run === undefined) {
    return;
  }

  const ceiling = await resolveCeiling(config, run.role);

  if (ceiling === undefined || run.peakContext <= ceiling) {
    return;
  }

  return `This ${run.role} reached ${formatCount(run.peakContext)} context, past its ${formatCount(ceiling)} ceiling: resuming it re-reads more history than a fresh start costs. Start a new ${run.role} instead, briefed as walking §Resumed agents states.`;
}
