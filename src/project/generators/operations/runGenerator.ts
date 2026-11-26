import { resolveWithin } from "#foundation/filesystem/index";
import { runGateProcess, type GateResult } from "#project/gate/index";
import type { ResolvedGenerator } from "#project/generators/types/ResolvedGenerator";
import type { Directory } from "#types/Directory";

/**
 * Runs the generator's command in its scope's directory, naming the
 * result after it.
 */
export async function runGenerator(
  root: Directory,
  { name, command, dir }: ResolvedGenerator,
): Promise<GateResult> {
  const result = await runGateProcess(resolveWithin(root, dir), "sh", [
    "-c",
    command,
  ]);

  return { ...result, name };
}
