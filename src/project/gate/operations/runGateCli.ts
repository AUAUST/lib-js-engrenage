import { runGateProcess } from "#project/gate/operations/runGateProcess";
import type { GateResult } from "#project/gate/ports/GateResult";
import type { Directory } from "#types/Directory";

export function runGateCli(
  root: Directory,
  args: readonly string[],
): Promise<GateResult> {
  const entry = process.argv[1];

  if (entry === undefined) {
    throw new Error("Cannot find the running engrenage CLI");
  }

  return runGateProcess(root, process.execPath, [entry, ...args]);
}
