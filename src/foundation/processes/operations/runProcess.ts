import type { SpawnOptions } from "node:child_process";

import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import type { ProcessResult } from "#foundation/processes/types/ProcessResult";

// @debt the error drops the stderr a caller captured instead of inheriting it
export async function runProcess(
  command: string,
  args: readonly string[],
  options: Pick<SpawnOptions, "cwd" | "env" | "signal" | "stdio">,
): Promise<ProcessResult> {
  const result = await spawnProcess(command, args, options);

  const commandLine = [command, ...args].join(" ");

  if (result.error !== undefined) {
    throw new Error(`Cannot run ${commandLine}`, {
      cause: result.error,
    });
  }

  if (result.signal !== null) {
    throw new Error(`${commandLine} was killed by ${result.signal}`);
  }

  if (result.status !== 0) {
    throw new Error(`${commandLine} exited with code ${result.status}`);
  }

  return result;
}
