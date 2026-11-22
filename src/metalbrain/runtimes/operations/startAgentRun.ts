import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { resolveAgentRunFile } from "#metalbrain/runtimes/utils/resolveAgentRunFile";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function startAgentRun(
  directory: Directory,
  run: { session: string; agent: string; role: string; transcript: File },
): Promise<void> {
  const path = resolveAgentRunFile(directory, run, "running");

  await mkdir(dirname(path), { recursive: true });

  await writeFile(
    path,
    `${JSON.stringify({ role: run.role, transcript: run.transcript })}\n`,
  );
}
