import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/ports/GateResult";
import type { Files } from "#types/Files";

/**
 * @experimental
 */
export type GateRun = (
  config: LoadedConfig,
  files: Files,
) => Promise<GateResult>;
