import { resolveBinary } from "#foundation/processes/index";
import { runGateProcess } from "#project/gate/operations/runGateProcess";
import type { GateResult } from "#project/gate/ports/GateResult";
import type { Directory } from "#types/Directory";
import type { KnownPackageName } from "#types/KnownPackageName";

export async function runGateBinary(
  root: Directory,
  packageName: KnownPackageName,
  args: readonly string[],
  binary: string = packageName,
): Promise<GateResult> {
  return runGateProcess(root, process.execPath, [
    await resolveBinary(root, packageName, binary),
    ...args,
  ]);
}
