import { runGateCli, type GateResult } from "#project/gate/index";
import type { LoadedConfig } from "#project/config/index";

export function runSyncCheck(config: LoadedConfig): Promise<GateResult> {
  return runGateCli(config.context.root, ["sync", "--check"]);
}
