import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { readAgentRun } from "#metalbrain/runtimes/operations/readAgentRun";
import { resolveAgentRunFile } from "#metalbrain/runtimes/utils/resolveAgentRunFile";
import type { AgentRun } from "#metalbrain/runtimes/types/AgentRun";
import type { Directory } from "#types/Directory";

export async function writeAgentRun(
  directory: Directory,
  run: Omit<AgentRun, "stops">,
  { stopped = true }: { stopped?: boolean } = {},
): Promise<AgentRun> {
  const path = resolveAgentRunFile(directory, run, "recorded");

  const previous = await readAgentRun(path);

  const recorded = {
    ...run,
    stops: (previous?.stops ?? 0) + (stopped ? 1 : 0),
  };

  await mkdir(dirname(path), { recursive: true });

  await writeFile(path, `${JSON.stringify(recorded, null, 2)}\n`);

  await rm(resolveAgentRunFile(directory, run, "running"), { force: true });

  return recorded;
}
