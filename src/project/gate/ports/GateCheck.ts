import type { LoadedConfig } from "#project/config/index";
import type { GateResult } from "#project/gate/ports/GateResult";

/**
 * Checks the whole project without writing any file.
 *
 * @experimental
 */
export type GateCheck = (config: LoadedConfig) => Promise<GateResult>;
