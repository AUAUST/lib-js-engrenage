import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { isMissingError } from "#foundation/filesystem/index";
import { readAgentRun } from "#metalbrain/runtimes/operations/readAgentRun";
import { parseAgentRunFile } from "#metalbrain/runtimes/utils/parseAgentRunFile";
import type { AgentRun } from "#metalbrain/runtimes/types/AgentRun";
import type { Directory } from "#types/Directory";

// @debt lists recursively to serve both the stats root and one session directory, so a run file anywhere below, such as under `starts/`, would count as a run; callers should name the level they read
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
      .filter((record) => parseAgentRunFile(record, "recorded") !== undefined)
      .map((record) => readAgentRun(join(directory, record))),
  );

  return runs.filter((run) => run !== undefined);
}
