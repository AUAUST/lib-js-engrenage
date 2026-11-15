import { readdir } from "node:fs/promises";

import {
  isMissingError,
  readTextFile,
  resolveWithin,
} from "#foundation/filesystem/index";
import { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
import { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
import { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
import { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
import { formatCount } from "#tools/agents/utils/formatCount";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";

const runningSuffix = ".running";

async function listRunningAgents(
  directory: Directory,
): Promise<readonly { agent: string; role: string }[]> {
  let files: readonly string[];

  try {
    files = await readdir(directory);
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }

  return Promise.all(
    files
      .filter((file) => file.endsWith(runningSuffix))
      .map(async (file) => {
        const role = await readTextFile(resolveWithin(directory, file));

        return {
          agent: file.slice(0, -runningSuffix.length),
          role: role?.trim() ?? "",
        };
      }),
  );
}

async function resolveFreshness(
  config: LoadedConfig,
  role: string,
): Promise<number | undefined> {
  const definitions = await getSkillDefinitions({
    fillers: await createAgentFillers(config),
    extensions: await listActiveExtensions(config),
  });

  return definitions.find(({ agent }) => agent?.name === role)?.agent
    ?.freshness;
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
    listRunningAgents(directory),
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

  const freshness = await resolveFreshness(config, run.role);

  if (
    freshness === undefined ||
    run.peakContext <= freshness * run.startContext
  ) {
    return;
  }

  return `This ${run.role} grew from ${formatCount(run.startContext)} to ${formatCount(run.peakContext)} context, past ${freshness}× its start: resuming it re-reads more history than a fresh start costs. Start a new ${run.role} instead, briefed as walking §Resumed agents states.`;
}
