import { runGateCli, type GateResult } from "#project/gate/index";
import type { LoadedConfig } from "#project/config/index";

export function runStructureCheck(config: LoadedConfig): Promise<GateResult> {
  return runGateCli(config.context.root, ["structure", "--check"]);
}
