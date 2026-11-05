import { spawn, type SpawnOptions } from "node:child_process";

import type { ProcessResult } from "#foundation/processes/types/ProcessResult";

export function spawnProcess(
  command: string,
  args: readonly string[],
  options: Pick<SpawnOptions, "cwd" | "env" | "stdio">,
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, options);

    let stdout = "";
    let stderr = "";

    child.stdout?.setEncoding("utf-8").on("data", (chunk: string) => {
      stdout += chunk;
    });

    child.stderr?.setEncoding("utf-8").on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.once("error", (error) => {
      resolve({
        status: null,
        signal: null,
        stdout,
        stderr,
        error,
      });
    });

    child.once("close", (status, signal) => {
      resolve({
        status,
        signal,
        stdout,
        stderr,
        error: undefined,
      });
    });
  });
}
