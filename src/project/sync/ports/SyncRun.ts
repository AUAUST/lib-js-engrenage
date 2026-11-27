import type { LoadedConfig } from "#project/config/index";
import type { SyncFlags } from "#project/sync/ports/SyncFlags";

/** @experimental */
export type SyncRun = (
  config: LoadedConfig,
  flags: SyncFlags,
) => void | Promise<void>;
