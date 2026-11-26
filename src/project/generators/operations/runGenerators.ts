import { resolveWithin } from "#foundation/filesystem/index";
import { runGateProcess, type GateResult } from "#project/gate/index";
import type { ResolvedGenerator } from "#project/generators/types/ResolvedGenerator";
import type { Directory } from "#types/Directory";

/**
 * Runs `generators` one after another, stopping at the first that fails and
 * naming the result after it.
 */
export async function runGenerators(
  root: Directory,
  generators: readonly ResolvedGenerator[],
): Promise<GateResult> {
  for (const { name, command, dir } of generators) {
    const result = await runGateProcess(resolveWithin(root, dir), "sh", [
      "-c",
      command,
    ]);

    if (!result.ok) {
      return { ...result, name };
    }
  }

  return { ok: true, output: "" };
}
