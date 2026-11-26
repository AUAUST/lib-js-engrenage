import { runGenerator } from "#project/generators/operations/runGenerator";
import type { GateResult } from "#project/gate/index";
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
  for (const generator of generators) {
    const result = await runGenerator(root, generator);

    if (!result.ok) {
      return result;
    }
  }

  return { ok: true, output: "" };
}
