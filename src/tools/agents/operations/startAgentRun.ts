import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { resolveAgentRunFile } from "#tools/agents/utils/resolveAgentRunFile";
import type { Directory } from "#types/Directory";

export async function startAgentRun(
  directory: Directory,
  run: { session: string; agent: string; role: string },
): Promise<void> {
  const path = resolveAgentRunFile(directory, run, "running");

  await mkdir(dirname(path), { recursive: true });

  await writeFile(path, `${run.role}\n`);
}
