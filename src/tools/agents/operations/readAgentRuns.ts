import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { isMissingError } from "#foundation/filesystem/index";
import { readAgentRun } from "#tools/agents/operations/readAgentRun";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { Directory } from "#types/Directory";

async function listRecords(directory: Directory): Promise<readonly string[]> {
  try {
    return await readdir(directory, { recursive: true });
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }
}

export async function readAgentRuns(
  directory: Directory,
): Promise<readonly AgentRun[]> {
  const records = await listRecords(directory);

  const runs = await Promise.all(
    records
      .filter((record) => record.endsWith(".json"))
      .map((record) => readAgentRun(join(directory, record))),
  );

  return runs.filter((run) => run !== undefined);
}
