import { getSkillDefinitions } from "#metalbrain/runtimes/operations/getSkillDefinitions";
import { readAgentRuns } from "#metalbrain/runtimes/operations/readAgentRuns";
import { readRunningAgents } from "#metalbrain/runtimes/operations/readRunningAgents";
import { formatCount } from "#metalbrain/runtimes/utils/formatCount";
import type { FragmentSources } from "#metalbrain/facts/index";
import type { Directory } from "#types/Directory";

async function resolveCeiling(
  fragments: FragmentSources,
  role: string,
): Promise<number | undefined> {
  const definitions = await getSkillDefinitions({ fragments });

  return definitions.find(({ agent }) => agent?.name === role)?.agent?.ceiling;
}

/**
 * Why resuming `recipient`, an agent of the session whose runs `directory` holds,
 * should start a fresh agent instead, or `undefined` when it may resume.
 */
export async function checkAgentResume(
  {
    directory,
    fragments,
  }: { directory: Directory; fragments: FragmentSources },
  recipient: string,
): Promise<string | undefined> {
  const [runs, running] = await Promise.all([
    readAgentRuns(directory),
    readRunningAgents(directory),
  ]);

  // @debt a recipient that is not an agent id resolves to the agents whose role it names, so an agent addressed by any other name escapes the limit
  const name = recipient.replace(/ \[[^\]]*\]$/u, "");

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

  const ceiling = await resolveCeiling(fragments, run.role);

  if (ceiling === undefined || run.peakContext <= ceiling) {
    return;
  }

  return `This ${run.role} reached ${formatCount(run.peakContext)} context, past its ${formatCount(ceiling)} ceiling: resuming it re-reads more history than a fresh start costs. Start a new ${run.role} instead, briefed as walking §Resumed agents states.`;
}
