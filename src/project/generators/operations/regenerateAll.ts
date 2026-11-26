import { listGenerators } from "#project/generators/operations/listGenerators";
import { runGenerators } from "#project/generators/operations/runGenerators";
import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/index";

/**
 * Runs every generator of the project in declaration order.
 */
export async function regenerateAll(config: LoadedConfig): Promise<GateResult> {
  return runGenerators(config.context.root, await listGenerators(config));
}
