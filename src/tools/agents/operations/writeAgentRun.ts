import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { resolveWithin } from "#foundation/filesystem/index";
import { readAgentRun } from "#tools/agents/operations/readAgentRun";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { Directory } from "#types/Directory";

export async function writeAgentRun(
  directory: Directory,
  run: Omit<AgentRun, "stops">,
): Promise<AgentRun> {
  const path = resolveWithin(directory, run.session, `${run.agent}.json`);

  const previous = await readAgentRun(path);

  const recorded = { ...run, stops: (previous?.stops ?? 0) + 1 };

  await mkdir(dirname(path), { recursive: true });

  await writeFile(path, `${JSON.stringify(recorded, null, 2)}\n`);

  return recorded;
}
