import { spawnProcess } from "#foundation/processes/index";
import type { GateResult } from "#project/gate/ports/GateResult";
import type { Directory } from "#types/Directory";

export async function runGateProcess(
  root: Directory,
  command: string,
  args: readonly string[],
): Promise<GateResult> {
  const { status, stdout, stderr, error } = await spawnProcess(command, args, {
    cwd: root,
  });

  return {
    ok: error === undefined && status === 0,
    output: error === undefined ? stdout + stderr : error.message,
  };
}
